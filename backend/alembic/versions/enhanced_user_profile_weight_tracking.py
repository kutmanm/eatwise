"""Add enhanced user profile fields and weight tracking

Revision ID: enhanced_profile_weight
Revises: ea591d909b77
Create Date: 2024-11-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'enhanced_profile_weight'
down_revision: Union[str, None] = 'ea591d909b77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new enum types
    gender_enum = postgresql.ENUM('male', 'female', 'other', 'prefer_not_to_say', name='gender')
    gender_enum.create(op.get_bind())
    
    timeframe_enum = postgresql.ENUM('2_weeks', '1_month', '3_months', '6_months', '1_year', 'custom', name='timeframe')
    timeframe_enum.create(op.get_bind())
    
    goaltype_enum = postgresql.ENUM('weight_loss', 'muscle_gain', 'maintain', 'body_recomposition', name='goaltype')
    goaltype_enum.create(op.get_bind())
    
    activitylevel_enum = postgresql.ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active', name='activitylevel')
    activitylevel_enum.create(op.get_bind())

    # Add new columns to user_profiles table
    op.add_column('user_profiles', sa.Column('gender', gender_enum, nullable=False, server_default='prefer_not_to_say'))
    op.add_column('user_profiles', sa.Column('initial_weight', sa.Float(), nullable=False, server_default='70.0'))
    op.add_column('user_profiles', sa.Column('current_weight', sa.Float(), nullable=False, server_default='70.0'))
    op.add_column('user_profiles', sa.Column('target_weight', sa.Float(), nullable=False, server_default='70.0'))
    op.add_column('user_profiles', sa.Column('time_frame', timeframe_enum, nullable=False, server_default='3_months'))
    op.add_column('user_profiles', sa.Column('target_date', sa.DateTime(), nullable=True))
    op.add_column('user_profiles', sa.Column('water_goal', sa.Float(), nullable=False, server_default='2000.0'))
    op.add_column('user_profiles', sa.Column('calorie_goal', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('protein_goal', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('carb_goal', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('fat_goal', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('diet_preferences', sa.JSON(), nullable=True))
    op.add_column('user_profiles', sa.Column('breakfast_time', sa.Time(), nullable=True, server_default='08:00:00'))
    op.add_column('user_profiles', sa.Column('lunch_time', sa.Time(), nullable=True, server_default='12:30:00'))
    op.add_column('user_profiles', sa.Column('dinner_time', sa.Time(), nullable=True, server_default='19:00:00'))
    op.add_column('user_profiles', sa.Column('snack_times', sa.JSON(), nullable=True))
    op.add_column('user_profiles', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))
    op.add_column('user_profiles', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')))

    # Migrate existing weight data to current_weight and initial_weight
    op.execute("""
        UPDATE user_profiles 
        SET current_weight = weight, 
            initial_weight = weight, 
            target_weight = weight
        WHERE weight IS NOT NULL
    """)

    # Remove old weight column
    op.drop_column('user_profiles', 'weight')

    # Create weight_logs table
    op.create_table('weight_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('logged_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('notes', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_weight_logs_user_date', 'weight_logs', ['user_id', 'logged_at'])
    op.create_index('ix_weight_logs_user_id', 'weight_logs', ['user_id'])

    # Create user_feedback table (rename from feedback to avoid conflicts)
    op.create_table('user_feedback',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('sent_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_user_feedback_user_date', 'user_feedback', ['user_id', 'sent_at'])
    op.create_index('ix_user_feedback_user_id', 'user_feedback', ['user_id'])

    # Update subscriptions table
    op.add_column('subscriptions', sa.Column('status', sa.String(), nullable=False, server_default='trialing'))

    # Update users table to include stripe fields
    op.add_column('users', sa.Column('stripe_customer_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('subscription_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('subscription_end', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove new columns from users table
    op.drop_column('users', 'subscription_end')
    op.drop_column('users', 'subscription_id')
    op.drop_column('users', 'stripe_customer_id')

    # Remove status column from subscriptions
    op.drop_column('subscriptions', 'status')

    # Drop new tables
    op.drop_table('user_feedback')
    op.drop_table('weight_logs')

    # Add back old weight column to user_profiles
    op.add_column('user_profiles', sa.Column('weight', sa.Float(), nullable=True))

    # Migrate current_weight back to weight
    op.execute("UPDATE user_profiles SET weight = current_weight")

    # Remove new columns from user_profiles
    op.drop_column('user_profiles', 'updated_at')
    op.drop_column('user_profiles', 'created_at')
    op.drop_column('user_profiles', 'snack_times')
    op.drop_column('user_profiles', 'dinner_time')
    op.drop_column('user_profiles', 'lunch_time')
    op.drop_column('user_profiles', 'breakfast_time')
    op.drop_column('user_profiles', 'diet_preferences')
    op.drop_column('user_profiles', 'fat_goal')
    op.drop_column('user_profiles', 'carb_goal')
    op.drop_column('user_profiles', 'protein_goal')
    op.drop_column('user_profiles', 'calorie_goal')
    op.drop_column('user_profiles', 'water_goal')
    op.drop_column('user_profiles', 'target_date')
    op.drop_column('user_profiles', 'time_frame')
    op.drop_column('user_profiles', 'target_weight')
    op.drop_column('user_profiles', 'current_weight')
    op.drop_column('user_profiles', 'initial_weight')
    op.drop_column('user_profiles', 'gender')

    # Drop enum types
    op.execute('DROP TYPE IF EXISTS activitylevel')
    op.execute('DROP TYPE IF EXISTS goaltype')
    op.execute('DROP TYPE IF EXISTS timeframe')
    op.execute('DROP TYPE IF EXISTS gender')