from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.core.config import settings
from typing import Dict
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check() -> Dict[str, str]:
    """健康检查端点，返回服务状态和版本信息"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "mode": settings.ENV
    }

@router.get("/system/init-status")
async def check_init_status(
    session: AsyncSession = Depends(get_session)
) -> Dict[str, bool]:
    """检查系统初始化状态"""
    try:
        # 验证数据库连接
        await session.execute("SELECT 1")
        
        # 检查必要的表是否存在
        result = await session.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='user'
        """)
        tables_exist = bool(result.scalar())
        
        return {
            "initialized": tables_exist,
            "database_connected": True,
            "migration_completed": True
        }
    except Exception as e:
        logger.error(f"System initialization check failed: {str(e)}")
        return {
            "initialized": False,
            "database_connected": False,
            "migration_completed": False,
            "error": str(e)
        }