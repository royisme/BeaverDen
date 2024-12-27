from fastapi import APIRouter, Depends, HTTPException
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
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session),
):
    try:
        auth_service = AuthService(session)
        user_exists = auth_service.check_user_exists(data.username)
        if user_exists:
            raise HTTPException(status_code=400, detail="User already exists")
        user, access_token, refresh_token, expires_at =  auth_service.register_user(data, Authorize)
        
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
    Authorize: AuthJWT = Depends(AuthJWT),
    session: Session = Depends(get_session),
):
    auth_service = AuthService(session)
    user, token, refresh_token, expires_at = auth_service.authenticate_user(
        data,
        Authorize
    )
    return BaseResponse(data={
        "user": user.to_dict(),
        "token": {
            "accessToken": token,
            "refreshToken": refresh_token,
            "expiresAt": expires_at.isoformat()
        }
    })


@router.post("/refreshToken")
async def refresh_token(Authorize: AuthJWT = Depends(AuthJWT)):
    Authorize.jwt_refresh_token_required()
    current_user_id = Authorize.get_jwt_subject()
    
    new_access_token = Authorize.create_access_token(subject=current_user_id)
    refresh_token = Authorize.create_refresh_token(subject=current_user_id)
    expires_at = Authorize.get_access_token_expires()
    return BaseResponse(data={
        "accessToken": new_access_token,
        "refreshToken": refresh_token,
        "expiresAt": expires_at.isoformat()
    })  


@router.post("/logout")
async def logout(Authorize: AuthJWT = Depends(AuthJWT)):
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    # 处理登出逻辑，例如清除会话或令牌
    return BaseResponse(data={"message": "Logged out successfully"})


