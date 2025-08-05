"""Add stripe integration fields
 
Revision ID: stripe_integration
Revises: fix_user_feedback_nullable
Create Date: 2024-01-20 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'stripe_integration'
down_revision = 'fix_user_feedback_nullable'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # These are already in the model but need a migration to apply them to existing database
    # Adding Stripe specific fields to the users table if they don't exist
    try:
        op.add_column('users', sa.Column('stripe_customer_id', sa.String(), nullable=True))
        op.add_column('users', sa.Column('subscription_id', sa.String(), nullable=True))
        op.add_column('users', sa.Column('subscription_end', sa.DateTime(), nullable=True))
    except Exception as e:
        print(f"Error adding Stripe columns: {e}")
        print("Columns might already exist. Continuing...")

    # Adding status column to subscriptions table if it doesn't exist
    try:
        op.add_column('subscriptions', sa.Column('status', sa.String(), nullable=False, server_default='trialing'))
    except Exception as e:
        print(f"Error adding status column: {e}")
        print("Column might already exist. Continuing...")

def downgrade() -> None:
    # Drop columns if needed for rollback
    op.drop_column('users', 'subscription_end')
    op.drop_column('users', 'subscription_id')
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('subscriptions', 'status')