"""Add favourite_devices table.

Revision ID: 001
Revises:
Create Date: 2026-09-24
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'favourite_devices',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_key', sa.String(255), nullable=False),
        sa.Column('serial', sa.String(64), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_favourite_devices_user_key', 'favourite_devices', ['user_key'])
    op.create_unique_constraint('uq_user_device', 'favourite_devices', ['user_key', 'serial'])


def downgrade():
    op.drop_constraint('uq_user_device', 'favourite_devices', type_='unique')
    op.drop_index('ix_favourite_devices_user_key', table_name='favourite_devices')
    op.drop_table('favourite_devices')
