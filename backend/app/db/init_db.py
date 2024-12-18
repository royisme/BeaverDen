
import logging
from sqlalchemy.orm import Session
from app.models.base import Base
from app.db.seed.seed_init import DatabaseSeeder

logger = logging.getLogger(__name__)

def init_db(session: Session) -> None:
    """初始化数据库
    
    这个函数执行所有必要的数据库初始化操作，包括：
    1. 创建数据库表
    2. 插入初始数据
    """
    try:
        # 创建所有表
        Base.metadata.create_all(session.bind)
        
        # 初始化数据
        seeder = DatabaseSeeder(session)
        seeder.seed_all()
        
        session.commit()
        logger.info("数据库初始化成功完成")
        
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        session.rollback()
        raise