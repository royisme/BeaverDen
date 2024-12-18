"""add_nullable_menu_fields

Revision ID: 110157f6880b
Revises: 86d3ea6eb6e3
Create Date: 2024-12-16 17:51:39.810444

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '110157f6880b'
down_revision: Union[str, None] = '86d3ea6eb6e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None




def upgrade() -> None:
    with op.batch_alter_table('menu_configs') as batch_op:
        batch_op.create_foreign_key(
            'fk_menu_parent',  # 给外键一个明确的名称
            'menu_configs',    # 引用的表
            ['parent_id'],     # 本表中的外键列
            ['id']            # 引用表中的主键列
        )

def downgrade() -> None:
    with op.batch_alter_table('menu_configs') as batch_op:
        batch_op.drop_constraint(
            'fk_menu_parent',
            type_='foreignkey'
        )