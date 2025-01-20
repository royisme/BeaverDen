from fastapi import APIRouter
from app.api.v1.endpoints import system,  user_init, auth, users, finance
# 创建主路由器
api_router = APIRouter()

# 注册各模块的路由
api_router.include_router(
    system.router,
    prefix="/system",
    tags=["system"]
)
# 注册用户初始化路由
api_router.include_router(
    user_init.router,
    prefix="/init",
    tags=["initialization"]
)
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"]
)

api_router.include_router(
    users.router,
    prefix="/user",
    tags=["user"]
)
api_router.include_router(
    finance.router,
    prefix="/finance",
    tags=["finance"]
)