"""add openai key to sessions

Revision ID: 7c6c77cd9a55
Revises: 123075b61fc0
Create Date: 2026-02-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7c6c77cd9a55"
down_revision: Union[str, Sequence[str], None] = "123075b61fc0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "sessions",
        sa.Column("openai_key", sa.String(), nullable=True),
    )
    op.create_index("ix_sessions_openai_key", "sessions", ["openai_key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_sessions_openai_key", table_name="sessions")
    op.drop_column("sessions", "openai_key")
