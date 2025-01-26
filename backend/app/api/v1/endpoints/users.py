from fastapi import APIRouter, Depends
from app.services.user_service import UserService
from app.models.user import User
from app.db.session import get_session
from app.api.v1.endpoints.api_models import UserPreferencesResponse, UpdateUserPreferencesRequest, BaseResponse
from app.core.auth_jwt import get_current_user
from sqlalchemy.orm import Session
from fastapi import HTTPException
import logging


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{user_id}/preferences/", response_model=BaseResponse[UserPreferencesResponse])
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """获取当前用户设置"""
    user_service = UserService(session)
    user_preferences = user_service.get_user_preferences(current_user)
    return BaseResponse[UserPreferencesResponse](data=user_preferences)


@router.put("/{user_id}/preferences/")
async def update_user_preferences(
    settings_update: UpdateUserPreferencesRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新当前用户设置"""
    user_service = UserService(session)
    user_service.update_user_preferences(current_user, settings_update.dict(exclude_unset=True))
    return BaseResponse(status=200, message="User settings updated successfully")


@router.put("/{user_id}/avatar/")
async def update_user_avatar(
    avatar_path: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新当前用户头像"""
    user_service = UserService(session)
    user_service.update_user_avatar(current_user, avatar_path)
    return BaseResponse(status=200, message="User avatar updated successfully")


@router.put("/{user_id}/nickname/")
async def update_user_nickname(
    nickname: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新当前用户昵称"""
    user_service = UserService(session)
    user_service.update_user_nickname(current_user, nickname)
    return BaseResponse(status=200, message="User nickname updated successfully")


@router.put("/{user_id}/email/")
async def update_user_email(
    email: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """更新当前用户邮箱"""
    user_service = UserService(session)
    user_service.update_user_email(current_user, email)
    return BaseResponse(status=200, message="User email updated successfully")