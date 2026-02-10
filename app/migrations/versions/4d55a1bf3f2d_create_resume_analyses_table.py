"""create resume analyses table

Revision ID: 4d55a1bf3f2d
Revises: 82a645b654a9
Create Date: 2026-02-09 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4d55a1bf3f2d"
down_revision: Union[str, Sequence[str], None] = "82a645b654a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "resume_analyses",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("resume_id", sa.String(), nullable=False),
        sa.Column("user_email", sa.String(), nullable=False),
        sa.Column("source_json", sa.JSON(), nullable=False),
        sa.Column("analysis_json", sa.JSON(), nullable=True),
        sa.Column("model", sa.String(), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_resume_analyses_id"), "resume_analyses", ["id"], unique=False)
    op.create_index(op.f("ix_resume_analyses_resume_id"), "resume_analyses", ["resume_id"], unique=False)
    op.create_index(op.f("ix_resume_analyses_user_email"), "resume_analyses", ["user_email"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_resume_analyses_user_email"), table_name="resume_analyses")
    op.drop_index(op.f("ix_resume_analyses_resume_id"), table_name="resume_analyses")
    op.drop_index(op.f("ix_resume_analyses_id"), table_name="resume_analyses")
    op.drop_table("resume_analyses")

