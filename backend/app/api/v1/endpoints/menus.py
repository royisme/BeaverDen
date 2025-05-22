from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.session import get_session
from app.core.auth_jwt import get_current_user
from app.services.menu_service import MenuService
from app.models.user import User
from app.api.v1.endpoints.api_models import BaseResponse

router = APIRouter()

@router.get("/user-menus")
async def get_user_menus(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> BaseResponse[List[Dict[str, Any]]]:
    """
    获取当前用户可访问的菜单
    
    返回用户有权限访问的所有菜单项
    """
    menu_service = MenuService(session)
    menus = menu_service.get_user_menus(current_user)
    return BaseResponse(data=menus)

@router.get("/menu-groups")
async def get_menu_groups(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> BaseResponse[List[Dict[str, Any]]]:
    """
    获取按组分类的菜单
    
    返回按组分类的菜单，用于侧边栏显示
    """
    menu_service = MenuService(session)
    groups = menu_service.get_menu_groups(current_user)
    return BaseResponse(data=groups)
