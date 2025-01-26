from sqlalchemy.orm import Session
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.auth_jwt import AuthJWT
import logging
from app.models.user import User,UserPreferences,UserSession
from app.models.enums import AccountStatus
from app.api.v1.endpoints.api_models import RegisterRequest,LoginRequest
from app.utils.helpers import generate_random_avatar_path
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

    def register_user(self, user_data: RegisterRequest, Authorize: AuthJWT) -> tuple[User, str, str, datetime]:
        """注册新用户"""
        logger.info(f"Registering new user: {user_data.username}")
        try:
            # 添加详细日志
            logger.info("Creating user object with username=%s, email=%s,password=%s", user_data.username, user_data.email,user_data.password)

            user = User(
                username=user_data.username,
                email=user_data.email,
                nickname=user_data.nickname,
                avatar_path=generate_random_avatar_path(user_data.username),
                account_status=AccountStatus.ACTIVE
            )
            user.set_password(user_data.password)
            self.session.add(user)
            self.session.flush()
            logger.debug(f"User {user_data.username} created in database")

            logger.info("start create user settings")
            # 创建用户设置
            preferences = UserPreferences(
                user_id=user.id,
                **user_data.preferences.dict()
            )

            # 创建访问令牌
            access_token = Authorize.create_access_token(subject=str(user.id))

            refresh_token = Authorize.create_refresh_token(subject=str(user.id))

            expires_at = Authorize.get_access_token_expires()
  
            # 创建用户会话
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
            logger.info("end create user session")

            
            self.session.add(preferences)
            self.session.add(user_session)
            self.session.commit()
            
            logger.info(f"User {user_data.username} registered successfully")
            return user, access_token, refresh_token, expires_at
        except Exception as e:
            logger.error(f"Error registering user {user_data.username}: {str(e)}")
            self.session.rollback()
            raise

    def authenticate_user(self, login_request: LoginRequest, Authorize: AuthJWT) -> tuple[User, str, datetime]:
        """
        验证用户登录并返回用户信息和令牌
        
        Args:
            login_request: 登录请求数据
            Authorize: JWT授权对象
            
        Returns:
            tuple[User, str, datetime]: 用户对象、访问令牌和过期时间
            
        Raises:
            HTTPException: 用户名或密码错误时抛出400错误
        """
        logger.info(f"Login attempt for user: {login_request.username}")
        user = self.session.query(User).filter_by(username=login_request.username).first()
        if not user :
            logger.warning(f"Login failed: User {login_request.username} not found")
            raise HTTPException(
                status_code=412,
                detail="用户不存在"  # 不暴露具体是哪个错误
            )
        if not user.verify_password(login_request.password):
            logger.warning(f"Login failed: Invalid password for user {login_request.username}")
            raise HTTPException(
                status_code=413,
                detail="用户密码错误"  # 不暴露具体是哪个错误
            )
        token = Authorize.create_access_token(subject=str(user.id))
        refresh_token = Authorize.create_refresh_token(subject=str(user.id))
        expires_at = Authorize.get_access_token_expires()
        user_session = self.session.query(UserSession).filter_by(user_id=user.id, device_id=login_request.deviceInfo.deviceId).first()
        logger.info("user_session: %s", user_session)
        print("user_session: %s", type(user_session))
        if user_session:
            user_session.update_device_info(login_request.deviceInfo)
            user_session.token = token
            user_session.token_expires_at = expires_at
            user_session.last_active_at = datetime.now(timezone.utc)
        else:
            user_session = UserSession(
                user_id=user.id,
                token=token,
                token_expires_at=expires_at,
                **login_request.deviceInfo.dict()
            )
            self.session.add(user_session)

        self.session.commit()
        logger.info(f"User {login_request.username} logged in successfully")
        return user, token, refresh_token, expires_at