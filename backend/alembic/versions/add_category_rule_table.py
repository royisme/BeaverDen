"""add category rule table

Revision ID: add_category_rule_table
Revises: 38fd0b4c5eb0
Create Date: 2023-01-30 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_category_rule_table'
down_revision = '38fd0b4c5eb0'
branch_labels = None
depends_on = None


def upgrade():
    # Create category_rule table
    op.create_table('category_rule',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('category_id', sa.String(length=36), nullable=False),
        sa.Column('field', sa.Enum('DESCRIPTION', 'MERCHANT', name='matchfield'), nullable=False),
        sa.Column('pattern', sa.String(length=255), nullable=False),
        sa.Column('match_type', sa.Enum('EXACT', 'CONTAINS', 'REGEX', name='matchtype'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('priority', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['transaction_category.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Add indexes
    op.create_index(op.f('ix_category_rule_user_id'), 'category_rule', ['user_id'], unique=False)
    op.create_index(op.f('ix_category_rule_category_id'), 'category_rule', ['category_id'], unique=False)
    op.create_index(op.f('ix_category_rule_is_active'), 'category_rule', ['is_active'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_category_rule_is_active'), table_name='category_rule')
    op.drop_index(op.f('ix_category_rule_category_id'), table_name='category_rule')
    op.drop_index(op.f('ix_category_rule_user_id'), table_name='category_rule')
    
    # Drop table
    op.drop_table('category_rule')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS matchfield')
    op.execute('DROP TYPE IF EXISTS matchtype')
