"""create resumes table

Revision ID: 82a645b654a9
Revises: 9ef2f12c8f0d
Create Date: 2026-02-07 21:55:43.126667

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82a645b654a9'
down_revision: Union[str, Sequence[str], None] = '9ef2f12c8f0d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "resumes",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_email", sa.String(), nullable=False),
        sa.Column("normalized_json", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_resumes_id"), "resumes", ["id"], unique=False)
    op.create_index(op.f("ix_resumes_user_email"), "resumes", ["user_email"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_resumes_user_email"), table_name="resumes")
    op.drop_index(op.f("ix_resumes_id"), table_name="resumes")
    op.drop_table("resumes")
