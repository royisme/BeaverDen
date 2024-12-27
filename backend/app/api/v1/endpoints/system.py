# src/app/api/v1/endpoints/system.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_session_context, check_database_status
from app.core.config import settings
from app.api.v1.endpoints.api_models import (
    BaseResponse,
    SystemHealthStatus,
    DatabaseStatus,
    SystemInitStatus
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health", response_model=BaseResponse[SystemHealthStatus])
def health_check() -> BaseResponse[SystemHealthStatus]:
    """健康检查端点，返回服务基本状态"""
    status = SystemHealthStatus(
        status="healthy",
        version=settings.VERSION,
        mode=settings.ENV,
    )
    return BaseResponse(data=status)


@router.get("/init-status", response_model=BaseResponse[SystemInitStatus])
def check_system_init(
) -> BaseResponse[SystemInitStatus]:
    """检查系统初始化状态，包括数据库连接和迁移状态"""
    try:
        with get_session_context() as session:
            db_connected, db_initialized, migration_completed, db_version = check_database_status(session)

        # 构建状态响应
        health_status = SystemHealthStatus(
            status="healthy" if db_connected else "unhealthy",
            version=settings.VERSION,
            mode=settings.ENV
        )

        db_status = DatabaseStatus(
            isConnected=db_connected,
            isInitialized=db_initialized,
            migrationCompleted=migration_completed,
            version=db_version
        )

        # 系统就绪条件：数据库已连接、已初始化且迁移完成
        is_system_ready = all([
            db_connected,
            db_initialized,
            migration_completed
        ])

        init_status = SystemInitStatus(
            isSystemReady=is_system_ready,
            backendStatus=health_status,
            databaseStatus=db_status
        )

        return BaseResponse(data=init_status)
    except Exception as e:
        logger.info(f"Error checking system initialization status: {str(e)}")
        return BaseResponse(
            status=500,
            message="Failed to check system status",
            data=SystemInitStatus(
                isSystemReady=False,
                backendStatus=SystemHealthStatus(
                    status="unhealthy",
                    version=settings.VERSION,
                    mode=settings.ENV
                ),
                databaseStatus=DatabaseStatus(
                    isConnected=False,
                    isInitialized=False,
                    migrationCompleted=False,
                    version=settings.VERSION
                ),
                error=str(e)
            )
        )