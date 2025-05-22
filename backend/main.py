# backend/main.py
import os
import sys
import signal
import logging
import logging.handlers
from pathlib import Path
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import typer
from pydantic import ValidationError
from jwt.exceptions import PyJWTError
from fastapi.exceptions import HTTPException, RequestValidationError

from app.core.config import settings
from app.core.runtime_config import RuntimeConfigManager
from app.core.exception_handlers import (
    jwt_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    pydantic_validation_exception_handler,
)
from app.api.v1.router import api_router
from app.db.session import create_start_app_handler, create_stop_app_handler
from app.core.startup_manager import StartupManager

# 初始化 Typer CLI
cli = typer.Typer()

# 配置根日志记录器
logger = logging.getLogger(__name__)

def get_project_root() -> Path:
    """动态获取项目根目录"""
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # 打包后的环境
        return Path(sys._MEIPASS).resolve().parent / "backend"
    # 开发环境
    return Path(__file__).resolve().parents[1]

def configure_cors(app: FastAPI, origins: List[str]) -> None:
    """配置CORS中间件"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.DEBUG else origins,  # 在开发模式下允许所有源
        allow_credentials=True,
        allow_methods=["*"],  # 允许所有方法
        allow_headers=["*"],  # 允许所有头部
        expose_headers=["*"],
        max_age=3600,
    )

def register_exception_handlers(app: FastAPI) -> None:
    """注册全局异常处理器"""
    app.add_exception_handler(PyJWTError, jwt_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(ValidationError, pydantic_validation_exception_handler)

def register_routers(app: FastAPI) -> None:
    """注册应用路由"""
    from app.core.auth_jwt import AuthJWT
    from fastapi import Depends

    # 添加全局依赖
    app.dependency_overrides[AuthJWT] = lambda: AuthJWT()

    app.include_router(api_router, prefix="/api/v1")

def create_app(config_path: str = None) -> FastAPI:
    """应用工厂函数"""
    # 初始化运行时配置
    if config_path:
        try:
            runtime_config = RuntimeConfigManager.initialize(config_path)
            # 应用运行时配置
            settings.apply_runtime_config(runtime_config.config)
            logger.info("Runtime configuration initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize runtime config: {str(e)}")
            raise

    # 初始化基础配置
    settings.PROJECT_ROOT = get_project_root()

    # 创建FastAPI实例
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION
    )


    # 配置核心功能
    configure_cors(
        app,
        origins=[
            f"http://localhost:{settings.BACKEND_PORT}",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "electron://localhost"
        ] + settings.ADDITIONAL_CORS_ORIGINS
    )
    register_exception_handlers(app)
    register_routers(app)

    # 添加生命周期事件
    app.add_event_handler("startup", create_start_app_handler(app))
    app.add_event_handler("shutdown", create_stop_app_handler(app))

    # 创建启动管理器并存储在应用状态中
    startup_manager = StartupManager(app)
    app.state.startup_manager = startup_manager

    # 添加系统初始化事件
    @app.on_event("startup")
    async def initialize_system():
        await startup_manager.initialize_system()

    return app

def configure_logging() -> None:
    """集中化日志配置"""
    # 确定日志目录
    log_dir = (
        settings.PROJECT_ROOT / "logs"
        if settings.ENV == "development"
        else settings.USER_DATA_PATH / "logs"
    )
    log_dir.mkdir(parents=True, exist_ok=True)

    # 日志文件路径
    log_file = log_dir / f"{settings.PROJECT_NAME}_{settings.ENV}.log"

    # 日志格式配置
    formatter = logging.Formatter(
        fmt='%(asctime)s.%(msecs)03d [%(levelname)s] %(name)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 文件处理器（带日志轮转）
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG)

    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)

    # 配置根日志记录器
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # 配置应用日志记录器
    app_logger = logging.getLogger('app')
    app_logger.setLevel(logging.DEBUG)

    # 设置第三方库日志级别
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DB_ECHO else logging.WARNING
    )

    # 输出一些初始日志以确认配置
    app_logger.debug("Debug logging enabled")
    app_logger.info(f"Logging configured in {settings.ENV} mode")

    logger.info(f"Logging configured in {settings.ENV} mode")
    logger.debug("Debug logging enabled" if settings.DEBUG else "Debug logging disabled")

def setup_signal_handlers(app: FastAPI) -> None:
    """配置信号处理器"""
    def shutdown_handler(signum, frame):
        logger.info(f"Received signal {signum}, initiating shutdown...")
        # 可以添加应用级别的清理逻辑
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown_handler)
    signal.signal(signal.SIGINT, shutdown_handler)
    logger.info("Signal handlers configured with application context")

@cli.command()
def start_dev(
    port: int = typer.Option(8486, help="Port to run the development server"),
    reload: bool = typer.Option(True, help="Enable auto-reload")
):
    """启动开发服务器"""
    configure_logging()
    app = create_app()

    logger.info(f"Starting development server on port {port}")
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        reload=reload,
        log_level="info"
    )

@cli.command()
def start_prod(config_path: str = typer.Argument(..., help="Path to runtime config")):
    """启动生产服务器（供Electron调用）"""
    # 第一步：初始化配置和日志
    configure_logging()

    # 第二步：创建应用实例
    config_path = os.path.join(config_path, "runtime-config.json")
    app = create_app(config_path)

    # 第三步：配置信号处理器（必须在app创建之后）
    setup_signal_handlers(app)

    # 第四步：获取运行时配置
    runtime_config = RuntimeConfigManager.get_instance()
    port,_ = runtime_config.get_network_config()
    # 第五步：启动服务器
    logger.info(f"Starting production server on port {port}")
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="info"
    )

if __name__ == "__main__":
    # 检测Electron环境变量
    if electron_user_data := os.environ.get("ELECTRON_USER_DATA_PATH"):
        settings.USER_DATA_PATH = electron_user_data
        start_prod(electron_user_data)
    else:
        cli()