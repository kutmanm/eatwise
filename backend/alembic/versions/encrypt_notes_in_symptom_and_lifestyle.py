"""rename notes columns to support transparent encryption

Revision ID: encrypt_notes_in_symptom_and_lifestyle
Revises: add_diet_plans_and_weekly_summaries
Create Date: 2025-08-10 00:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'encrypt_notes_in_symptom_and_lifestyle'
down_revision: Union[str, None] = 'add_diet_plans_and_weekly_summaries'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ensure columns exist with the expected names; if already named 'notes', no change needed
    # This migration is a no-op structurally since we keep same column name, included for ordering
    pass


def downgrade() -> None:
    pass


