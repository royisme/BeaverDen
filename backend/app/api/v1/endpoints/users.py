from fastapi import APIRouter, Depends
from app.services.user_service import UserService
from app.models.user import User
from app.db.session import get_session
from app.api.v1.endpoints.api_models import UserPreferencesResponse, UpdateUserPreferencesRequest, BaseResponse
from app.core.auth_jwt import AuthJWT
from sqlalchemy.orm import Session
from fastapi import HTTPException
import logging


router = APIRouter()
logger = logging.getLogger(__name__)

def get_current_user(Authorize: AuthJWT = Depends(AuthJWT), session: Session = Depends(get_session)) -> User:
    Authorize.jwt_required()
    current_user_id = Authorize.get_jwt_subject()
    user = session.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
@router.get("/{user_id}/preferences/", response_model=BaseResponse[UserPreferencesResponse])
async def get_user_preferences(
    user_id: str,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_session)
):
    """获取当前用户设置"""
    user_preferences = user_service.get_user_preferences(current_user)
    return BaseResponse[UserPreferencesResponse](data=user_preferences)

@router.put("/{user_id}/preferences/")
async def update_user_preferences(
    user_id: str,
    settings_update: UpdateUserPreferencesRequest,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_session)
):
    """更新当前用户设置"""
    user_service.update_user_preferences(current_user, settings_update.dict(exclude_unset=True))
    return BaseResponse(status=200, message="User settings updated successfully")

