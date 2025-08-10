"""Enhance meal data with micronutrients and additional metadata

Revision ID: enhance_meal_data
Revises: add_symptom_tracking
Create Date: 2024-01-15 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'enhance_meal_data'
down_revision: Union[str, None] = 'add_symptom_tracking'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add micronutrient columns to meals table
    op.add_column('meals', sa.Column('sodium', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('potassium', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('calcium', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('magnesium', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('iron', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('zinc', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('vitamin_c', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('vitamin_d', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('vitamin_b12', sa.Float(), nullable=True))
    op.add_column('meals', sa.Column('folate', sa.Float(), nullable=True))
    
    # Add additional metadata columns
    op.add_column('meals', sa.Column('meal_type', sa.String(), nullable=True))
    op.add_column('meals', sa.Column('preparation_method', sa.String(), nullable=True))
    op.add_column('meals', sa.Column('ingredients', sa.JSON(), nullable=True))
    op.add_column('meals', sa.Column('dietary_tags', sa.JSON(), nullable=True))
    
    # Create index for meal_type for efficient filtering
    op.create_index('ix_meals_meal_type', 'meals', ['meal_type'])


def downgrade() -> None:
    # Drop index first
    op.drop_index('ix_meals_meal_type', table_name='meals')
    
    # Remove additional metadata columns
    op.drop_column('meals', 'dietary_tags')
    op.drop_column('meals', 'ingredients')
    op.drop_column('meals', 'preparation_method')
    op.drop_column('meals', 'meal_type')
    
    # Remove micronutrient columns
    op.drop_column('meals', 'folate')
    op.drop_column('meals', 'vitamin_b12')
    op.drop_column('meals', 'vitamin_d')
    op.drop_column('meals', 'vitamin_c')
    op.drop_column('meals', 'zinc')
    op.drop_column('meals', 'iron')
    op.drop_column('meals', 'magnesium')
    op.drop_column('meals', 'calcium')
    op.drop_column('meals', 'potassium')
    op.drop_column('meals', 'sodium')
