# scripts/init_db.py

import asyncio
import logging
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.init_db import init_db

logger = logging.getLogger(__name__)

def initialize_database() -> None:
    """执行数据库初始化的主入口函数"""
    logger.info("开始数据库初始化...")
    
    try:
        # 创建数据库引擎和会话
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        
        with SessionLocal() as session:
            init_db(session)
            
        logger.info("数据库初始化完成！")
        
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        raise

if __name__ == "__main__":
    initialize_database()