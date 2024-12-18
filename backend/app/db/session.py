# backend/app/db/session.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator, Callable
from fastapi import FastAPI
from app.core.config import settings
import asyncio
from contextlib import asynccontextmanager

# 创建异步引擎
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    future=True
)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """获取数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

def create_start_app_handler(app: FastAPI) -> Callable:
    """创建应用启动处理器"""
    async def start_app() -> None:
        # 确保数据库目录存在
        settings.DATABASE_DIR.mkdir(parents=True, exist_ok=True)
        
        # 初始化表
        from backend.app.models.base import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    return start_app

def create_stop_app_handler(app: FastAPI) -> Callable:
    """创建应用关闭处理器"""
    async def stop_app() -> None:
        await engine.dispose()
    
    return stop_app