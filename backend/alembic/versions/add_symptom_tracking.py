"""Add symptom tracking tables

Revision ID: add_symptom_tracking
Revises: fix_user_feedback_nullable
Create Date: 2024-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_symptom_tracking'
down_revision: Union[str, None] = 'fix_user_feedback_nullable'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create symptom_logs table
    op.create_table('symptom_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('symptom_type', sa.String(), nullable=False),
        sa.Column('symptom_domain', sa.String(), nullable=False),
        sa.Column('severity', sa.Integer(), nullable=False),
        sa.Column('occurred_at', sa.DateTime(), nullable=False),
        sa.Column('logged_at', sa.DateTime(), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('triggers', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for symptom_logs
    op.create_index('ix_symptom_logs_user_occurred', 'symptom_logs', ['user_id', 'occurred_at'])
    op.create_index('ix_symptom_logs_domain_severity', 'symptom_logs', ['symptom_domain', 'severity'])
    op.create_index('ix_symptom_logs_type', 'symptom_logs', ['symptom_type'])
    op.create_index('ix_symptom_logs_user_id', 'symptom_logs', ['user_id'])

    # Create lifestyle_logs table
    op.create_table('lifestyle_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('sleep_hours', sa.Float(), nullable=True),
        sa.Column('sleep_quality', sa.Integer(), nullable=True),
        sa.Column('stress_level', sa.Integer(), nullable=True),
        sa.Column('exercise_minutes', sa.Integer(), nullable=True),
        sa.Column('exercise_type', sa.String(), nullable=True),
        sa.Column('water_intake', sa.Float(), nullable=True),
        sa.Column('alcohol_servings', sa.Integer(), nullable=True),
        sa.Column('medications', sa.JSON(), nullable=True),
        sa.Column('supplements', sa.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('logged_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for lifestyle_logs
    op.create_index('ix_lifestyle_logs_user_date', 'lifestyle_logs', ['user_id', 'date'])
    op.create_index('ix_lifestyle_logs_user_id', 'lifestyle_logs', ['user_id'])


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_lifestyle_logs_user_id', table_name='lifestyle_logs')
    op.drop_index('ix_lifestyle_logs_user_date', table_name='lifestyle_logs')
    op.drop_index('ix_symptom_logs_user_id', table_name='symptom_logs')
    op.drop_index('ix_symptom_logs_type', table_name='symptom_logs')
    op.drop_index('ix_symptom_logs_domain_severity', table_name='symptom_logs')
    op.drop_index('ix_symptom_logs_user_occurred', table_name='symptom_logs')
    
    # Drop tables
    op.drop_table('lifestyle_logs')
    op.drop_table('symptom_logs')
