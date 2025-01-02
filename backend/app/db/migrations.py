# -*- coding: utf-8 -*-
import logging
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from alembic import command
from pathlib import Path
from app.core.config import settings
from sqlalchemy.orm import Session
from app.models.menu import MenuConfig, MenuType, MenuGroup
import os

logger = logging.getLogger(__name__)

def check_and_upgrade_db() -> None:
    """check and upgrade database structure
    
    use Alembic to execute database migration. this function runs when the application starts,
    ensuring that the database structure is consistent with the latest model definitions.
    """
    try:
        alembic_ini_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../alembic.ini"))
        logger.info(f"Looking for alembic.ini at: {alembic_ini_path}")

        if not Path(alembic_ini_path).exists():
            raise RuntimeError(f"can't find Alembic config file: {alembic_ini_path}")


        alembic_cfg = Config(str(alembic_ini_path))
        alembic_cfg.set_main_option("script_location", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../alembic")))
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        logger.info("Starting database migration check...")
        
        # Get the head revision
        script = ScriptDirectory.from_config(alembic_cfg)
        head_rev = script.get_current_head()
        
        # Check current revision
        from sqlalchemy import create_engine
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as connection:
            context = MigrationContext.configure(connection)
            current_rev = context.get_current_revision()
        
        logger.info(f"Current database revision: {current_rev}")
        logger.info(f"Target head revision: {head_rev}")

        if current_rev == head_rev:
            logger.info("Database is already at the latest revision - no upgrade needed")
            logger.info("Database check completed successfully")
            return

        # If not at head, run upgrade
        logger.info("Database needs upgrade, running migration...")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database upgrade completed successfully")
        return
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