# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import typer
import signal
import sys
import os
from pathlib import Path
import logging
import logging.handlers
from app.core.runtime_config import RuntimeConfigManager
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import create_start_app_handler, create_stop_app_handler
from jwt.exceptions import PyJWTError
from fastapi.exceptions import HTTPException, RequestValidationError
from pydantic import ValidationError
from app.core.exception_handlers import jwt_exception_handler, http_exception_handler, validation_exception_handler, pydantic_validation_exception_handler
from app.core.auth_jwt import AuthJWT
from app.db.migrations import check_and_upgrade_db
# 设置日志记录
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

cli = typer.Typer()

def get_project_root():
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # 打包后的 Electron 环境
        project_root = Path(sys._MEIPASS).resolve().parent / "backend"
    else:
        # 开发环境
        project_root = Path(__file__).resolve().parents[1]
    return project_root
settings.PROJECT_ROOT = get_project_root()
app = FastAPI(title="Beaveden Backend")
def handle_shutdown(signum, frame):
    """处理终止信号的函数"""
    logger.info("接收到终止信号，正在清理资源...")
    # 确保数据库连接已关闭
    try:
        app.state.engine.dispose()
        logger.info("数据库连接已关闭")
    except Exception as e:
        logger.error(f"关闭数据库连接时发生错误: {str(e)}")
    
    sys.exit(0)

def setup_signal_handlers():
    """设置信号处理器"""
    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)
    logger.info("信号处理器已设置")

def create_app(config_path: str) -> FastAPI:
    # 初始化日志系统
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.info("Starting application initialization...")

    # 初始化运行时配置
    try:
        runtime_config = RuntimeConfigManager.initialize(config_path)
        logger.info("Runtime configuration initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize runtime config: {str(e)}")
        raise
    
    app = FastAPI(title=settings.PROJECT_NAME)
    setup_logging()

    # CORS配置
    origins = [
        f"http://localhost:{runtime_config.config.backendPort}",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "electron://localhost"
    ] + settings.ADDITIONAL_CORS_ORIGINS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=3600,
    )
   # 异常处理
    app.add_exception_handler(PyJWTError, lambda r, e: jwt_exception_handler(e))
    app.add_exception_handler(HTTPException, lambda r, e: http_exception_handler(e))
    app.add_exception_handler(RequestValidationError, lambda r, e: validation_exception_handler(e))
    app.add_exception_handler(ValidationError, lambda r, e: pydantic_validation_exception_handler(e))
    # 注册路由
    app.include_router(api_router, prefix="/api/v1")

    # 启动和关闭事件
    app.add_event_handler("startup", create_start_app_handler(app))
    app.add_event_handler("startup", check_and_upgrade_db) # 数据库迁移

    app.add_event_handler("shutdown", create_stop_app_handler(app))

    return app
def setup_logging():
    """配置日志系统"""
    # 在开发环境下使用项目目录，生产环境使用USER_DATA_PATH
    if settings.ENV == "development":
        log_dir = Path(settings.PROJECT_ROOT) / "backend/logs"
    else:
        log_dir = settings.USER_DATA_PATH / "logs"
    
    # 创建日志目录
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / f"beaveden_{settings.ENV}.log"

    # 配置日志格式
    formatter = logging.Formatter(
        fmt='%(asctime)s.%(msecs)03d [%(levelname)s] %(name)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 配置文件处理器，使用 RotatingFileHandler 进行日志轮转
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # 配置控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # 配置根日志记录器
    root_logger = logging.getLogger()
    # 清除现有的处理器
    root_logger.handlers.clear()
    root_logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # 设置一些特定模块的日志级别
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DB_ECHO else logging.WARNING
    )

    # 记录初始日志
    logger = logging.getLogger(__name__)
    logger.info(f"Logger initialized in {settings.ENV} mode")
    logger.info(f"Log file location: {log_file}")
    logger.debug("Debug logging is enabled")
def start_from_electron(config_path: str):
    """从Electron启动应用"""
    config_path = os.path.join(config_path, "runtime-config.json")
    # 设置信号处理器
    setup_signal_handlers()

    # 创建应用
    app = create_app(config_path)
    
    # 获取运行时配置
    runtime_config = RuntimeConfigManager.get_instance()
    port = runtime_config.get_port()

    # 启动服务器
    logger = logging.getLogger(__name__)
    logger.info(f"Electron: Starting backend server on port {port}...")
    try:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=port,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Electron: Failed to start backend server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # 设置基本日志配置

    electron_user_data_path = os.environ.get("ELECTRON_USER_DATA_PATH")
    print("data path:",electron_user_data_path)
    if electron_user_data_path:
        settings.USER_DATA_PATH = electron_user_data_path
        start_from_electron(electron_user_data_path)

    else:
        cli()
