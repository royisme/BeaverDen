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
    try:
        auth_service_instance = AuthService(session)
        user_exists = auth_service_instance.check_user_exists(data.username)
        if user_exists:
            raise HTTPException(status_code=400, detail="User already exists")
        user, access_token, refresh_token, expires_at = auth_service_instance.register_user(data, Authorize)
        
        return BaseResponse(data={
            "user": user.to_dict(),
            "token": {
                "accessToken": access_token,
                "refreshToken": refresh_token,
                "expiresAt": expires_at.isoformat()
            }
        })
    except Exception as e:
        session.rollback()
        logger.error(f"User registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=BaseResponse[LoginResponse])
async def login(
    data: LoginRequest,
    session: Session = Depends(get_session),
    Authorize: AuthJWT = Depends(AuthJWT)
):
    auth_service_instance = AuthService(session)
    user, access_token, refresh_token, expires_at = auth_service_instance.authenticate_user(data, Authorize)
    return BaseResponse(data={
        "user": user.to_dict(),
        "token": {
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "expiresAt": expires_at.isoformat()
        }
    })


@router.post("/refresh")
async def refresh_token(
    request: Request,
    Authorize: AuthJWT = Depends(AuthJWT)
):
    """刷新访问令牌"""
    # 获取刷新令牌
    authorization = request.headers.get("Authorization")
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        # 验证刷新令牌并创建新的访问令牌
        token_data = Authorize._verify_jwt(token, token_type="refresh")
        new_access_token = Authorize.create_access_token(token_data.sub)
        expires_at = Authorize.get_access_token_expires()
        
        return BaseResponse(data={
            "accessToken": new_access_token,
            "expiresAt": expires_at.isoformat()
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/logout")
async def logout(
    Authorize: AuthJWT = Depends(AuthJWT)
):
    """登出用户"""
    Authorize.jwt_required()  # 确保用户已登录
    return BaseResponse(message="Successfully logged out")
