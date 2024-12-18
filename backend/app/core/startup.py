from app.db.init_db import init_db
from app.db.migrations import check_and_upgrade_db
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from pathlib import Path

async def initialize_database() -> None:
    """数据库初始化流程"""
    db_path = Path(settings.DATABASE_URL.replace("sqlite:///", ""))
    
    # 检查数据库是否存在
    if not db_path.exists():
        async with AsyncSessionLocal() as session:
            await init_db(session)
    else:
        # 数据库存在，检查是否需要更新
        await check_and_upgrade_db()