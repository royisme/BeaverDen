"""add_module_support_to_feature

Revision ID: bb35403ef082
Revises: 8092f02508ed
Create Date: 2024-12-16 18:10:16.509771

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
from sqlalchemy.orm import Session

# revision identifiers, used by Alembic.
revision: str = 'bb35403ef082'
down_revision: Union[str, None] = '8092f02508ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('features') as batch_op:
        batch_op.add_column(sa.Column('module_key', sa.String(255), nullable=True))
        batch_op.add_column(sa.Column('config_schema', sa.JSON(), nullable=True))
    
    connection = op.get_bind()
    session = Session(bind=connection)
    
    try:
        # 通过 SQL 更新现有记录
        # 我们假设 feature_key 的格式类似 "basic_transaction", "advanced_reporting" 等
        # 取第一个下划线之前的部分作为 module_key
        session.execute(text("""
            UPDATE features 
            SET module_key = CASE
                WHEN feature_key LIKE 'basic_%' THEN 'core'
                WHEN feature_key LIKE 'advanced_%' THEN 'premium'
                ELSE substr(feature_key, 1, instr(feature_key || '_', '_') - 1)
            END,
            config_schema = json('{"type": "object", "properties": {}}')
            WHERE module_key IS NULL
        """))
        
        # 为不同类型的功能添加特定的配置模式
        session.execute(text("""
            UPDATE features 
            SET config_schema = json('{
                "type": "object",
                "properties": {
                    "max_transactions": {
                        "type": "integer",
                        "minimum": 0,
                        "default": 1000
                    },
                    "max_categories": {
                        "type": "integer",
                        "minimum": 0,
                        "default": 20
                    }
                }
            }')
            WHERE feature_key = 'basic_transaction'
        """))
        
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()
    
    # 3. 将 module_key 设为非空字段
    with op.batch_alter_table('features') as batch_op:
        batch_op.alter_column('module_key',
            existing_type=sa.String(255),
            nullable=False,
            server_default='core'  # 默认值设为 'core'
        )
        # config_schema 可以保持为可空，因为不是所有功能都需要配置


def downgrade() -> None:
    with op.batch_alter_table('features') as batch_op:
        batch_op.drop_column('module_key')
        batch_op.drop_column('config_schema')
