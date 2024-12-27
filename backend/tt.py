import logging
import traceback
from alembic.config import Config
from alembic import command

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    try:
        alembic_cfg = Config("alembic.ini")  # 视你的文件名而定
        head_rev = "8c96f0a11496"
        logger.info("Running test alembic upgrade to head_rev = %s ...", head_rev)
        command.upgrade(alembic_cfg, "head")
        logger.info("Upgrade completed!")
    except Exception as e:
        logger.error(f"Upgrade failed: {e}")
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()