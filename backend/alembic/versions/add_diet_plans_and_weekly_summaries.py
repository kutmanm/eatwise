"""add diet plans and weekly summaries tables

Revision ID: add_diet_plans_and_weekly_summaries
Revises: 
Create Date: 2025-08-10 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'add_diet_plans_and_weekly_summaries'
down_revision: Union[str, None] = 'ea591d909b77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'diet_plans',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('week_start', sa.Date(), nullable=False),
        sa.Column('plan', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_diet_plans_user_week', 'diet_plans', ['user_id', 'week_start'], unique=True)

    op.create_table(
        'weekly_summaries',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('week_start', sa.Date(), nullable=False),
        sa.Column('summary', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_weekly_summaries_user_week', 'weekly_summaries', ['user_id', 'week_start'], unique=True)

    op.create_table(
        'plan_feedbacks',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('week_start', sa.Date(), nullable=False),
        sa.Column('feedback', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_plan_feedbacks_user_week', 'plan_feedbacks', ['user_id', 'week_start'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_plan_feedbacks_user_week', table_name='plan_feedbacks')
    op.drop_table('plan_feedbacks')
    op.drop_index('ix_weekly_summaries_user_week', table_name='weekly_summaries')
    op.drop_table('weekly_summaries')
    op.drop_index('ix_diet_plans_user_week', table_name='diet_plans')
    op.drop_table('diet_plans')


