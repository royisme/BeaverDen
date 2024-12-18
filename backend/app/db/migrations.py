import logging
from alembic.config import Config
from alembic import command
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger(__name__)

def check_and_upgrade_db() -> None:
    """check and upgrade database structure
    
    use Alembic to execute database migration. this function runs when the application starts,
    ensuring that the database structure is consistent with the latest model definitions.
    """
    try:
        alembic_ini_path = Path(__file__).parent.parent / "alembic.ini"
        if not alembic_ini_path.exists():
            raise RuntimeError(f"can't find Alembic config file: {alembic_ini_path}")

        alembic_cfg = Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        logger.info("start checking database update...")
        command.upgrade(alembic_cfg, "head")
        logger.info("database update completed")
        
    except Exception as e:
        logger.error(f"database migration failed: {str(e)}")
        raise RuntimeError(f"database migration failed: {str(e)}") from e
def update_existing_menu_data(session: Session):
    """更新现有菜单数据"""
    menus = session.query(MenuConfig).all()
    for menu in menus:
        # 根据 menu_key 设置合适的默认值
        menu.type = MenuType.FEATURE
        menu.group = MenuGroup.MAIN
        menu.name = menu.menu_key.replace('_', ' ').title()
    session.commit()