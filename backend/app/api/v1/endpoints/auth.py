from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_session
from app.services.auth_service import AuthService
import logging
from app.api.v1.endpoints.api_models import LoginRequest, LoginResponse, BaseResponse, RegisterRequest
from app.core.auth_jwt import AuthJWT

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register")
async def register(
    data: RegisterRequest,
    session: Session = Depends(get_session),
    Authorize: AuthJWT = Depends(AuthJWT)
):
    """
    用户注册接口

    接收用户注册信息，创建新用户并返回用户信息和访问令牌
    """
    try:
        auth_service = AuthService(session)
        user, access_token, refresh_token, expires_at = auth_service.register_user(data, Authorize)

        return BaseResponse(data={
            "user": user.to_dict(),
            "token": {
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "expiresAt": expires_at.isoformat()
            }
        })
    except HTTPException as e:
        # 直接重新抛出HTTP异常
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"User registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"注册失败: {str(e)}")


@router.post("/login", response_model=BaseResponse[LoginResponse])
async def login(
    data: LoginRequest,
    session: Session = Depends(get_session),
    Authorize: AuthJWT = Depends(AuthJWT)
):
    """
    用户登录接口

    验证用户凭据并返回用户信息和访问令牌
    """
    try:
        auth_service = AuthService(session)
        user, access_token, refresh_token, expires_at = auth_service.authenticate_user(data, Authorize)

        return BaseResponse(data={
            "user": user.to_dict(),
            "token": {
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "expiresAt": expires_at.isoformat()
            }
        })
    except HTTPException as e:
        # 直接重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"登录失败: {str(e)}")


@router.post("/refresh")
async def refresh_token(
    request: Request,
    session: Session = Depends(get_session),
    Authorize: AuthJWT = Depends(AuthJWT)
):
    """
    刷新访问令牌

    使用有效的刷新令牌获取新的访问令牌
    """
    # 获取刷新令牌
    authorization = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="缺少授权头信息",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        # 解析授权头
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的授权格式",
                headers={"WWW-Authenticate": "Bearer"}
            )

        refresh_token = parts[1]

        # 验证刷新令牌
        try:
            token_data = Authorize._verify_jwt(refresh_token, token_type="refresh")
        except Exception as e:
            logger.warning(f"Invalid refresh token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效或已过期的刷新令牌",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # 获取用户ID
        user_id = token_data.sub

        # 检查用户是否存在且状态正常
        user = session.query(User).filter_by(id=user_id).first()
        if not user or user.account_status != AccountStatus.ACTIVE:
            logger.warning(f"Refresh token for non-existent or inactive user: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的用户",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # 创建新的访问令牌
        new_access_token = Authorize.create_access_token(user_id)
        expires_at = Authorize.get_access_token_expires()

        # 更新用户会话
        try:
            # 查找与此刷新令牌关联的会话
            user_session = session.query(UserSession).filter_by(
                user_id=user_id,
                token=refresh_token
            ).first()

            if user_session:
                user_session.token = new_access_token
                user_session.token_expires_at = expires_at
                user_session.last_active_at = datetime.now(timezone.utc)
                session.commit()
        except Exception as e:
            logger.error(f"Error updating session during token refresh: {str(e)}")
            # 会话更新失败不应该影响令牌刷新，所以这里只记录错误，不抛出异常

        return BaseResponse(data={
            "accessToken": new_access_token,
            "expiresAt": expires_at.isoformat()
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token refresh: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="令牌刷新过程中发生错误"
        )


@router.post("/logout")
async def logout(
    request: Request,
    session: Session = Depends(get_session),
    Authorize: AuthJWT = Depends(AuthJWT)
):
    """
    用户登出

    使当前会话失效
    """
    try:
        # 验证用户是否已登录
        Authorize.jwt_required()

        # 获取当前用户ID
        current_user_id = Authorize.get_jwt_subject()

        # 获取当前令牌
        authorization = request.headers.get("Authorization")
        if authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ")[1]

            # 查找并删除对应的会话
            try:
                user_session = session.query(UserSession).filter_by(
                    user_id=current_user_id,
                    token=token
                ).first()

                if user_session:
                    # 可以选择删除会话或将其标记为已登出
                    session.delete(user_session)
                    session.commit()
                    logger.info(f"User {current_user_id} logged out successfully")
            except Exception as e:
                logger.error(f"Error removing session during logout: {str(e)}")
                # 会话删除失败不应该影响登出操作，所以这里只记录错误，不抛出异常

        return BaseResponse(message="登出成功")
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        return BaseResponse(message="登出成功")  # 即使出错也返回成功，因为客户端会清除本地令牌
