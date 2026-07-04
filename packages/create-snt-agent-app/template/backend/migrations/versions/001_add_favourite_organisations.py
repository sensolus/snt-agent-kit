"""Add favourite_organisations table.

Revision ID: 001
Revises:
Create Date: 2026-05-16
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'favourite_organisations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_key', sa.String(255), nullable=False),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_favourite_organisations_user_key', 'favourite_organisations', ['user_key'])
    op.create_unique_constraint('uq_user_org', 'favourite_organisations', ['user_key', 'org_id'])


def downgrade():
    op.drop_constraint('uq_user_org', 'favourite_organisations', type_='unique')
    op.drop_index('ix_favourite_organisations_user_key', table_name='favourite_organisations')
    op.drop_table('favourite_organisations')
