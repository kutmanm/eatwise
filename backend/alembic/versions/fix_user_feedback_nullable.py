"""Fix user_feedback.user_id to be nullable for anonymous feedback

Revision ID: fix_user_feedback_nullable
Revises: enhanced_user_profile_weight_tracking
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fix_user_feedback_nullable'
down_revision = 'enhanced_profile_weight'
branch_labels = None
depends_on = None


def upgrade():
    # Make user_id nullable in user_feedback table to allow anonymous feedback
    op.alter_column('user_feedback', 'user_id',
                    existing_type=sa.UUID(),
                    nullable=True)


def downgrade():
    # Revert user_id to not nullable
    # Note: This might fail if there are anonymous feedback entries
    op.alter_column('user_feedback', 'user_id',
                    existing_type=sa.UUID(),
                    nullable=False)