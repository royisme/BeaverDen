"""add_nullable_menu_fields_2

Revision ID: 8092f02508ed
Revises: 110157f6880b
Create Date: 2024-12-16 18:03:11.143670

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session
from sqlalchemy import text
import enum

# revision identifiers, used by Alembic.
revision: str = '8092f02508ed'
down_revision: Union[str, None] = '110157f6880b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


class MenuType(str, enum.Enum):
    FEATURE = "feature"
    SETTING = "setting"

class MenuGroup(str, enum.Enum):
    MAIN = "main"
    SYSTEM = "system"

def upgrade() -> None:
    # 1. 首先添加可为空的新字段
    with op.batch_alter_table('menu_configs') as batch_op:
        batch_op.add_column(sa.Column('type', sa.String(50), nullable=True))
        batch_op.add_column(sa.Column('group', sa.String(50), nullable=True))
        batch_op.add_column(sa.Column('name', sa.String(255), nullable=True))
        
    # # 2. 更新现有数据
    # # 获取一个绑定的连接
    connection = op.get_bind()
    session = Session(bind=connection)
    
    try:
        # 更新所有现有记录
        session.execute(text("""
            UPDATE menu_configs 
            SET type = 'feature',
                "group" = 'main',
                name = REPLACE(UPPER(SUBSTR(menu_key, 1, 1)) || 
                             LOWER(SUBSTR(menu_key, 2)), 
                             '_', ' ')
            WHERE type IS NULL
        """))
        
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
    
    # 3. 最后修改字段为非空
    with op.batch_alter_table('menu_configs') as batch_op:
        batch_op.alter_column('type',
            existing_type=sa.String(50),
            nullable=False,
            server_default='feature'
        )
        batch_op.alter_column('group',
            existing_type=sa.String(50),
            nullable=False,
            server_default='main'
        )
        batch_op.alter_column('name',
            existing_type=sa.String(255),
            nullable=False
        )

def downgrade() -> None:
    with op.batch_alter_table('menu_configs') as batch_op:
        batch_op.drop_column('type')
        batch_op.drop_column('group')
        batch_op.drop_column('name')