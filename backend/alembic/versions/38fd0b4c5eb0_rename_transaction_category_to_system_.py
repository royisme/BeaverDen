"""rename_transaction_category_to_system_transaction_category

Revision ID: 38fd0b4c5eb0
Revises: 05f202836a5b
Create Date: 2025-01-23 11:13:04.639467

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.models.enums import SystemTransactionCategory


# revision identifiers, used by Alembic.
revision: str = '38fd0b4c5eb0'
down_revision: Union[str, None] = '05f202836a5b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def create_system_categories():
    """创建系统预定义的交易分类"""
    # 创建临时表来存储系统分类
    op.create_table(
        'temp_system_categories',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String, nullable=True),  
        sa.Column('parent_id', sa.String(36), nullable=True),
        sa.Column('user_id', sa.String(36), nullable=True),
        sa.Column('icon', sa.String(255), nullable=True),
        sa.Column('color', sa.String(7), nullable=True),
        sa.Column('system_category', sa.Enum(SystemTransactionCategory), nullable=True),
        sa.Column('is_system', sa.Boolean, default=True, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now())
    )

    # 获取所有系统分类
    categories = []
    for category in SystemTransactionCategory:
        parent = category.parent
        parent_id = None
        if parent:
            parent_id = f"system_{parent.value}"
        
        # 从枚举值的注释中获取描述
        description = category.value.replace('_', ' ').title()
        
        categories.append({
            'id': category.id,
            'name': category.display_name,
            'description': description,  
            'parent_id': parent_id,
            'user_id': None,  
            'icon': None,
            'color': None,
            'system_category': category.value,
            'is_system': True,
            'created_at': sa.func.now(),
            'updated_at': sa.func.now()
        })

    # 插入系统分类
    for category in categories:
        insert_sql = """
            INSERT INTO temp_system_categories (
                id, name, description, parent_id, user_id, icon, color,
                system_category, is_system, created_at, updated_at
            ) VALUES (
                '%(id)s', '%(name)s', '%(description)s', %(parent_id)s, %(user_id)s, 
                %(icon)s, %(color)s, '%(system_category)s', %(is_system)s, 
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """ % {
            'id': category['id'],
            'name': category['name'],
            'description': category['description'],
            'parent_id': 'NULL' if category['parent_id'] is None else f"'{category['parent_id']}'",
            'user_id': 'NULL' if category['user_id'] is None else f"'{category['user_id']}'",
            'icon': 'NULL' if category['icon'] is None else f"'{category['icon']}'",
            'color': 'NULL' if category['color'] is None else f"'{category['color']}'",
            'system_category': category['system_category'],
            'is_system': 'TRUE' if category['is_system'] else 'FALSE'
        }
        op.execute(insert_sql)

    # 将系统分类从临时表复制到正式表
    op.execute(
        """
        INSERT INTO transaction_category (
            id, name, description, parent_id, user_id, icon, color, 
            system_category, is_system, created_at, updated_at
        )
        SELECT id, name, description, parent_id, user_id, icon, color,
               system_category, is_system, created_at, updated_at
        FROM temp_system_categories
        """
    )

    # 删除临时表
    op.drop_table('temp_system_categories')


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    
    # Create base tables without foreign key dependencies first
    op.create_table('finance_account',
        sa.Column('account_name', sa.String(length=255), nullable=False),
        sa.Column('bank_name', sa.Enum('RBC', 'BMO', 'TD', 'CIBC', 'SCOTIA', 'HSBC', 'TANGERINE', 'SIMPLII', 'OTHER', name='financebankname'), nullable=False),
        sa.Column('account_type', sa.Enum('CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'CASH', 'OTHER', name='financeaccounttype'), nullable=False),
        sa.Column('currency', sa.Enum('USD', 'CNY', 'CAD', 'EUR', 'GBP', 'JPY', name='currency'), nullable=False),
        sa.Column('balance', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('card_type', sa.Enum('VISA', 'MASTERCARD', 'AMEX', 'DEBIT', 'OTHER', name='financeaccountcardtype'), nullable=True),
        sa.Column('account_number', sa.String(length=255), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', 'CLOSED', 'FROZEN', name='financeaccountstatus'), nullable=False),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('transaction_category',
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String, nullable=True),  
        sa.Column('parent_id', sa.String(length=36), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('icon', sa.String(length=255), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('system_category', sa.Enum(SystemTransactionCategory), nullable=True),
        sa.Column('is_system', sa.Boolean, default=True, nullable=False),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['parent_id'], ['transaction_category.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create system categories after transaction_category table exists
    create_system_categories()

    op.create_table('budget',
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('period_type', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=255), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create transaction table after finance_account and transaction_category exist
    op.create_table('transaction',
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('linked_account_id', sa.String(), nullable=True),
        sa.Column('linked_transaction_id', sa.String(), nullable=True),
        sa.Column('transaction_date', sa.DateTime(), nullable=False),
        sa.Column('posted_date', sa.DateTime(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.Enum('USD', 'CNY', 'CAD', 'EUR', 'GBP', 'JPY', name='currency'), nullable=False),
        sa.Column('type', sa.Enum('EXPENSE', 'INCOME', 'TRANSFER_OUT', 'TRANSFER_IN', 'REFUND', 'ADJUSTMENT', name='transactiontype'), nullable=False),
        sa.Column('category_id', sa.String(), nullable=True),
        sa.Column('merchant', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RECURRING', 'CLEARED', name='transactionstatus'), nullable=False),
        sa.Column('import_batch_id', sa.String(), nullable=True),
        sa.Column('raw_transaction_id', sa.String(), nullable=True),
        sa.Column('transaction_metadata', sa.JSON(), nullable=True),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['finance_account.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['transaction_category.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['import_batch_id'], ['import_batch.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['linked_account_id'], ['finance_account.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['linked_transaction_id'], ['transaction.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create raw_transaction table last since it depends on transaction
    op.create_table('raw_transaction',
        sa.Column('import_batch_id', sa.String(), nullable=False),
        sa.Column('row_number', sa.Integer(), nullable=False),
        sa.Column('raw_data', sa.JSON(), nullable=False),
        sa.Column('processed_data', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('transaction_id', sa.String(), nullable=True),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['import_batch_id'], ['import_batch.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['transaction_id'], ['transaction.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('import_batch',
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('statement_format', sa.Enum('CIBC_CREDIT', 'CIBC_DEBIT', 'RBC_CHECKING', 'RBC_CREDIT', 'RBC_SAVING', name='bankstatementformat'), nullable=False),
        sa.Column('file_name', sa.String(), nullable=False),
        sa.Column('file_content', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('processed_count', sa.Integer(), nullable=True),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['finance_account.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # 删除系统分类

    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('import_batch')
    op.drop_table('raw_transaction')
    op.drop_table('transaction')
    op.drop_table('budget')
    op.drop_table('transaction_category')
    op.drop_table('finance_account')
    # ### end Alembic commands ###
