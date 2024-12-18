# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import typer
import argparse
from app.core.config import settings
from app.core.runtime_config import RuntimeConfigManager
from app.api.v1.router import api_router
from app.db.session import create_start_app_handler, create_stop_app_handler

app = FastAPI(title="Beaveden Backend")
cli = typer.Typer()

def create_app(config_path: str) -> FastAPI:
    # 初始化运行时配置
    runtime_config = RuntimeConfigManager.initialize(config_path)
    
    # 加载应用配置


    app = FastAPI(title=settings.PROJECT_NAME)

    # CORS - 从运行时配置获取端口
    origins = [
        f"http://localhost:{runtime_config.config.backendPort}",  # 后端端口
        "http://localhost:5173",  # Vite dev server
        "electron://localhost"    # Electron
    ] + settings.ADDITIONAL_CORS_ORIGINS

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册路由
    app.include_router(api_router, prefix="/api/v1")

    # 启动和关闭事件
    app.add_event_handler("startup", create_start_app_handler(app))
    app.add_event_handler("shutdown", create_stop_app_handler(app))

    return app

@cli.command()
def start(
    config_path: str = typer.Option(..., help="Path to runtime config file"),
    reload: bool = typer.Option(False, help="Enable auto-reload")
):
    """启动应用服务器"""
    # 初始化运行时配置
    runtime_config = RuntimeConfigManager.initialize(config_path)
    port = runtime_config.get_port()

    # 创建应用
    app = create_app(config_path)

    # 启动服务器
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        reload=reload,
        log_level="info"
    )

def start_from_electron(config_path: str):
    """从 Electron 启动应用"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to runtime config file")
    args = parser.parse_args()

    # 创建应用
    app = create_app(args.config)
    
    # 获取运行时配置
    runtime_config = RuntimeConfigManager.get_instance()
    port = runtime_config.get_port()

    # 启动服务器
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        log_level="info"
    )

if __name__ == "__main__":
    import sys
    if "--config" in sys.argv:
        # 从 Electron 启动
        start_from_electron(sys.argv[sys.argv.index("--config") + 1])
    else:
        # 从命令行启动
        cli()