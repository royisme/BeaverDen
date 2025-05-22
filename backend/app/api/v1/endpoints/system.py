# src/app/api/v1/endpoints/system.py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.session import get_session_context, check_database_status, get_session
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
async def health_check(session: Session = Depends(get_session)) -> BaseResponse[SystemHealthStatus]:
    """健康检查端点，返回服务基本状态"""
    try:
        # 检查数据库连接
        from app.db.session import get_db_status
        db_connected, _, _, _ = get_db_status(session)

        status = SystemHealthStatus(
            status="healthy" if db_connected else "unhealthy",
            version=settings.VERSION,
            mode=settings.ENV,
        )
        return BaseResponse(data=status)
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return BaseResponse(
            status=500,
            message="Health check failed",
            data=SystemHealthStatus(
                status="unhealthy",
                version=settings.VERSION,
                mode=settings.ENV,
                error=str(e)
            )
        )


@router.get("/init-status", response_model=BaseResponse[SystemInitStatus])
async def check_system_init(request: Request) -> BaseResponse[SystemInitStatus]:
    """检查系统初始化状态，包括数据库连接和迁移状态"""
    try:
        # 从应用状态中获取启动管理器
        startup_manager = request.app.state.startup_manager

        # 获取系统状态
        status = startup_manager.get_system_status()

        # 转换为API响应模型
        health_status = SystemHealthStatus(
            status=status["backendStatus"]["status"],
            version=settings.VERSION,
            mode=settings.ENV
        )

        db_status = DatabaseStatus(
            isConnected=status["databaseStatus"]["isConnected"],
            isInitialized=status["databaseStatus"]["isInitialized"],
            migrationCompleted=status["databaseStatus"]["migrationCompleted"],
            version=status["databaseStatus"]["version"] or settings.VERSION
        )

        init_status = SystemInitStatus(
            isSystemReady=status["isSystemReady"],
            backendStatus=health_status,
            databaseStatus=db_status,
            error=", ".join([err["message"] for err in status["backendStatus"]["errors"]]) if status["backendStatus"]["errors"] else None
        )

        return BaseResponse(data=init_status)
    except Exception as e:
        logger.error(f"Error checking system initialization status: {str(e)}")
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


@router.get("/version")
async def get_version() -> BaseResponse:
    """
    获取系统版本信息

    返回系统的版本号和构建信息
    """
    version_info = {
        "version": settings.VERSION,
        "buildId": settings.BUILD_ID,
        "environment": settings.ENV,
        "isPackaged": settings.IS_PACKAGED
    }

    return BaseResponse(data=version_info)