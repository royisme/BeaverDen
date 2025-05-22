from fastapi import APIRouter
from app.api.v1.endpoints import system, user_init, auth, users, accounts, transactions, budgets, reports, category_rules, menus
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
    accounts.router,
    prefix="/finance",
    tags=["accounts"]
)

api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["transactions"]
)

api_router.include_router(
    budgets.router,
    prefix="/budgets",
    tags=["budgets"]
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["reports"]
)

api_router.include_router(
    category_rules.router,
    prefix="/category-rules",
    tags=["category-rules"]
)

api_router.include_router(
    menus.router,
    prefix="/menus",
    tags=["menus"]
)
