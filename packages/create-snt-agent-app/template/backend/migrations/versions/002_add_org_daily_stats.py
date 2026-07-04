"""Add org_daily_stats table.

Revision ID: 002
Revises: 001
Create Date: 2026-06-08
"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'org_daily_stats',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('org_id', sa.Integer(), nullable=False),
        sa.Column('org_name', sa.String(255)),
        sa.Column('snapshot_date', sa.Date(), nullable=False),
        sa.Column('tracker_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('user_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('captured_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_org_daily_stats_org_id', 'org_daily_stats', ['org_id'])
    op.create_index('ix_org_daily_stats_snapshot_date', 'org_daily_stats', ['snapshot_date'])
    op.create_unique_constraint('uq_org_day', 'org_daily_stats', ['org_id', 'snapshot_date'])


def downgrade():
    op.drop_constraint('uq_org_day', 'org_daily_stats', type_='unique')
    op.drop_index('ix_org_daily_stats_snapshot_date', table_name='org_daily_stats')
    op.drop_index('ix_org_daily_stats_org_id', table_name='org_daily_stats')
    op.drop_table('org_daily_stats')
