from sqlalchemy.orm import Session
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.core.auth_jwt import AuthJWT
import logging
import re
from typing import Tuple, Optional
from app.models.user import User, UserPreferences, UserSession, UserSettings
from app.models.enums import AccountStatus
from app.api.v1.endpoints.api_models import RegisterRequest, LoginRequest
from app.utils.helpers import generate_random_avatar_path
from app.db.seed.seed_init import SeedConfig
logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, session: Session):
        self.session = session
        logger.debug("AuthService initialized")

    def check_user_exists(self, username: str) -> bool:
        """检查用户是否已存在"""
        logger.debug(f"Checking if user exists: {username}")
        exists = self.session.query(User).filter_by(username=username).first() is not None
        logger.debug(f"User {username} exists: {exists}")
        return exists

    def check_email_exists(self, email: str) -> bool:
        """检查邮箱是否已被使用"""
        logger.debug(f"Checking if email exists: {email}")
        exists = self.session.query(User).filter_by(email=email).first() is not None
        logger.debug(f"Email {email} exists: {exists}")
        return exists

    def validate_username(self, username: str) -> Tuple[bool, str]:
        """
        验证用户名是否有效

        规则:
        - 长度在3-20个字符之间
        - 只能包含字母、数字、下划线
        - 不能以数字开头

        Returns:
            Tuple[bool, str]: (是否有效, 错误信息)
        """
        if not username:
            return False, "用户名不能为空"

        if len(username) < 3 or len(username) > 20:
            return False, "用户名长度必须在3-20个字符之间"

        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', username):
            return False, "用户名只能包含字母、数字和下划线，且不能以数字开头"

        return True, ""

    def validate_email(self, email: str) -> Tuple[bool, str]:
        """
        验证邮箱是否有效

        Returns:
            Tuple[bool, str]: (是否有效, 错误信息)
        """
        if not email:
            return False, "邮箱不能为空"

        # 简单的邮箱格式验证
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return False, "邮箱格式不正确"

        return True, ""

    def validate_password(self, password: str) -> Tuple[bool, str]:
        """
        验证密码是否有效

        规则:
        - 长度至少8个字符
        - 包含至少一个数字
        - 包含至少一个字母

        Returns:
            Tuple[bool, str]: (是否有效, 错误信息)
        """
        if not password:
            return False, "密码不能为空"

        if len(password) < 8:
            return False, "密码长度必须至少为8个字符"

        if not re.search(r'\d', password):
            return False, "密码必须包含至少一个数字"

        if not re.search(r'[a-zA-Z]', password):
            return False, "密码必须包含至少一个字母"

        return True, ""

    def register_user(self, user_data: RegisterRequest, Authorize: AuthJWT) -> tuple[User, str, str, datetime]:
        """
        注册新用户

        Args:
            user_data: 用户注册数据
            Authorize: JWT授权对象

        Returns:
            tuple[User, str, str, datetime]: 用户对象、访问令牌、刷新令牌和过期时间

        Raises:
            HTTPException: 注册失败时抛出相应的错误
        """
        logger.info(f"Registering new user: {user_data.username}")

        # 验证用户输入
        self._validate_registration_data(user_data)

        try:
            # 创建用户对象
            logger.info("Creating user object with username=%s, email=%s", user_data.username, user_data.email)
            user = User(
                username=user_data.username,
                email=user_data.email,
                nickname=user_data.nickname or user_data.username,
                avatar_path=generate_random_avatar_path(user_data.username),
                account_status=AccountStatus.ACTIVE
            )
            user.set_password(user_data.password)
            self.session.add(user)
            self.session.flush()  # 获取用户ID
            logger.debug(f"User {user_data.username} created in database")

            # 创建用户偏好设置
            logger.info("Creating user preferences")
            preferences = UserPreferences(
                user_id=user.id,
                **user_data.preferences.dict()
            )
            self.session.add(preferences)

            # 创建用户设置
            logger.info("Creating user settings")
            settings = UserSettings(
                user_id=user.id,
                **SeedConfig.get_default_user_settings()
            )
            self.session.add(settings)

            # 创建访问令牌
            access_token = Authorize.create_access_token(subject=str(user.id))
            refresh_token = Authorize.create_refresh_token(subject=str(user.id))
            expires_at = Authorize.get_access_token_expires()

            # 创建用户会话
            logger.info("Creating user session")
            user_session = UserSession(
                user_id=user.id,
                device_id=user_data.deviceInfo.deviceId,
                device_name=user_data.deviceInfo.deviceName,
                device_type=user_data.deviceInfo.deviceType,
                os=user_data.deviceInfo.os,
                model=user_data.deviceInfo.model,
                manufacturer=user_data.deviceInfo.manufacturer,
                ip=user_data.deviceInfo.ip,
                last_active_at=datetime.now(timezone.utc),
                token=access_token,
                token_expires_at=expires_at,
            )
            self.session.add(user_session)

            # 提交事务
            self.session.commit()
            logger.info(f"User {user_data.username} registered successfully")

            return user, access_token, refresh_token, expires_at

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Error registering user {user_data.username}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"注册失败: {str(e)}"
            )

    def _validate_registration_data(self, user_data: RegisterRequest) -> None:
        """
        验证注册数据

        Args:
            user_data: 用户注册数据

        Raises:
            HTTPException: 验证失败时抛出相应的错误
        """
        # 验证用户名
        is_valid, error_msg = self.validate_username(user_data.username)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        # 检查用户名是否已存在
        if self.check_user_exists(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="用户名已被使用"
            )

        # 验证邮箱
        is_valid, error_msg = self.validate_email(user_data.email)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        # 检查邮箱是否已存在
        if self.check_email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="邮箱已被使用"
            )

        # 验证密码
        is_valid, error_msg = self.validate_password(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

    def authenticate_user(self, login_request: LoginRequest, Authorize: AuthJWT) -> tuple[User, str, str, datetime]:
        """
        验证用户登录并返回用户信息和令牌

        Args:
            login_request: 登录请求数据
            Authorize: JWT授权对象

        Returns:
            tuple[User, str, str, datetime]: 用户对象、访问令牌、刷新令牌和过期时间

        Raises:
            HTTPException: 登录失败时抛出相应的错误
        """
        logger.info(f"Login attempt for user: {login_request.username}")

        try:
            # 查找用户
            user = self.session.query(User).filter_by(username=login_request.username).first()
            if not user:
                logger.warning(f"Login failed: User {login_request.username} not found")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="用户名或密码错误"  # 安全起见，不明确指出是用户不存在
                )

            # 检查用户状态
            if user.account_status != AccountStatus.ACTIVE:
                logger.warning(f"Login failed: User {login_request.username} is not active (status: {user.account_status})")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="账户已被禁用，请联系管理员"
                )

            # 验证密码
            if not user.verify_password(login_request.password):
                logger.warning(f"Login failed: Invalid password for user {login_request.username}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="用户名或密码错误"  # 安全起见，不明确指出是密码错误
                )

            # 创建令牌
            access_token = Authorize.create_access_token(subject=str(user.id))
            refresh_token = Authorize.create_refresh_token(subject=str(user.id))
            expires_at = Authorize.get_access_token_expires()

            # 更新用户最后登录时间
            user.update_last_login()

            # 更新或创建用户会话
            try:
                user_session = self.session.query(UserSession).filter_by(
                    user_id=user.id,
                    device_id=login_request.deviceInfo.deviceId
                ).first()

                if user_session:
                    logger.info(f"Updating existing session for user {user.username}")
                    # 更新现有会话
                    user_session.token = access_token
                    user_session.token_expires_at = expires_at
                    user_session.last_active_at = datetime.now(timezone.utc)
                    user_session.ip = login_request.deviceInfo.ip
                    user_session.os = login_request.deviceInfo.os
                    user_session.device_name = login_request.deviceInfo.deviceName
                    user_session.device_type = login_request.deviceInfo.deviceType
                    user_session.model = login_request.deviceInfo.model
                    user_session.manufacturer = login_request.deviceInfo.manufacturer
                else:
                    logger.info(f"Creating new session for user {user.username}")
                    # 创建新会话
                    user_session = UserSession(
                        user_id=user.id,
                        device_id=login_request.deviceInfo.deviceId,
                        device_name=login_request.deviceInfo.deviceName,
                        device_type=login_request.deviceInfo.deviceType,
                        os=login_request.deviceInfo.os,
                        model=login_request.deviceInfo.model,
                        manufacturer=login_request.deviceInfo.manufacturer,
                        ip=login_request.deviceInfo.ip,
                        last_active_at=datetime.now(timezone.utc),
                        token=access_token,
                        token_expires_at=expires_at,
                    )
                    self.session.add(user_session)
            except Exception as e:
                logger.error(f"Error updating session for user {user.username}: {str(e)}")
                # 会话更新失败不应该影响登录，所以这里只记录错误，不抛出异常

            # 提交事务
            self.session.commit()
            logger.info(f"User {login_request.username} authenticated successfully")

            return user, access_token, refresh_token, expires_at

        except HTTPException:
            # 直接重新抛出HTTP异常
            raise
        except Exception as e:
            self.session.rollback()
            logger.error(f"Unexpected error during authentication: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="登录过程中发生错误，请稍后再试"
            )