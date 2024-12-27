# backend/app/db/session.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator, Callable
from fastapi import FastAPI, Request
from app.core.config import settings

import threading
import logging
import os
logger = logging.getLogger(__name__)

# 创建同步引擎
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO, 
    future=True
)

# 创建同步会话工厂
SessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# 使用线程本地存储来存储每个请求的会话
request_session = threading.local()

@contextmanager
def get_session_context() -> Generator[Session, None, None]:
    """获取数据库会话（上下文管理器版本，主要用于非请求上下文中）"""
    session = SessionLocal()

    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def get_session() -> Session:
    """
    获取数据库会话, 主要用于单元测试等非请求上下文中
    """
    return SessionLocal()



def check_database_status(session: Session):
    """检查数据库状态 (独立函数)"""
    db_connected = False
    db_initialized = False
    migration_completed = False
    db_version = None
    try:
        # 检查数据库连接
        session.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        db_connected = False
        # 如果数据库连接失败，直接返回
        return db_connected, db_initialized, migration_completed, db_version
    try:
        # 检查数据库是否已初始化（检查核心表是否存在）
        logger.info(f"db_connected: {db_connected}")
        if db_connected:
            # 检查核心表
            result = session.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='user'")
            )
            db_initialized = bool(result.scalar())
            logger.info(f"db_initialized: {db_initialized}")
            # 检查迁移状态
            if db_initialized:
                result_version = session.execute(
                    text("SELECT version_num FROM alembic_version")
                )
                db_version = result_version.scalar_one_or_none()
                # 数据库已初始化, 但是数据表为空
                if db_version is None:
                    migration_completed = False
                    db_version = None
                    logger.info("alembic_version table is empty or does not exist. Assuming initial migration.")
                else:
                    logger.info(f"Database version: {db_version}")
                    migration_completed = True
        return db_connected, db_initialized, migration_completed, db_version
    except Exception as e:
        logger.info(f"Error checking database status: {str(e)}")
        # 发生异常也需要返回
        return db_connected, db_initialized, migration_completed, db_version


def create_start_app_handler(app: FastAPI) -> Callable:
    """创建应用启动处理器"""
    def start_app() -> None:
        # 确保数据库目录存在
        # 检查 settings.DATABASE_URL 是否为 SQLite 数据库的连接字符串
        if settings.DATABASE_URL.startswith("sqlite:///"):
            db_path = settings.DATABASE_URL.replace("sqlite:///", "")
            # 如果是绝对路径，则不进行修改
            if not os.path.isabs(db_path):
                db_path = os.path.join(settings.PROJECT_ROOT, db_path)
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            logger.info(f"Database directory: {os.path.dirname(db_path)}")

    return start_app

def create_stop_app_handler(app: FastAPI) -> Callable:
    """创建应用关闭处理器"""
    def stop_app() -> None:
        # 释放引擎资源
        engine.dispose()

    return stop_app

