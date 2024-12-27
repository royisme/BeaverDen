from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_session
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class InitStatusResponse(BaseModel):
    """系统初始化状态响应模型"""
    database_available: bool
    migrations_up_to_date: bool

@router.get("/status", response_model=InitStatusResponse)
def check_init_status(
    session: Session = Depends(get_session)
) -> InitStatusResponse:
    """
    检查系统的基本就绪状态：数据库连接和迁移状态
    """
    try:
        # 检查数据库连接
        session.execute(text("SELECT 1"))
        database_available = True
    except Exception as db_e:
        logger.error(f"Database connection error: {db_e}")
        return InitStatusResponse(database_available=False, migrations_up_to_date=False)

    try:
        # 检查数据库迁移状态 (使用你之前提供的基于 Alembic 的方法)
        from alembic.config import Config
        from alembic import command
        alembic_config = Config("alembic.ini")
        current_head = command.revision(alembic_config, head='head')
        if current_head:
            result_version = session.execute(text("SELECT version_num FROM alembic_version"))
            db_version = result_version.scalar()
            migrations_up_to_date = db_version == current_head
        else:
            migrations_up_to_date = True
    except Exception as alembic_e:
        logger.warning(f"Error checking Alembic status: {alembic_e}")
        return InitStatusResponse(database_available=database_available, migrations_up_to_date=False)

    return InitStatusResponse(database_available=database_available, migrations_up_to_date=migrations_up_to_date)