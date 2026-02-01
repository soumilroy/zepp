"""backfill openai keys

Revision ID: 9ef2f12c8f0d
Revises: 7c6c77cd9a55
Create Date: 2026-02-01 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import secrets


# revision identifiers, used by Alembic.
revision: str = "9ef2f12c8f0d"
down_revision: Union[str, Sequence[str], None] = "7c6c77cd9a55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _generate_openai_key() -> str:
    return f"sk-{secrets.token_urlsafe(32)}"


def upgrade() -> None:
    bind = op.get_bind()
    sessions = sa.Table(
        "sessions",
        sa.MetaData(),
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("openai_key", sa.String),
    )

    existing_keys = {
        row.openai_key
        for row in bind.execute(sa.select(sessions.c.openai_key).where(sessions.c.openai_key.isnot(None)))
    }

    rows_without_key = bind.execute(
        sa.select(sessions.c.id).where(sessions.c.openai_key.is_(None))
    ).fetchall()

    for row in rows_without_key:
        new_key = _generate_openai_key()
        while new_key in existing_keys:
            new_key = _generate_openai_key()
        bind.execute(sessions.update().where(sessions.c.id == row.id).values(openai_key=new_key))
        existing_keys.add(new_key)

    with op.batch_alter_table("sessions") as batch_op:
        batch_op.alter_column("openai_key", existing_type=sa.String(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("sessions") as batch_op:
        batch_op.alter_column("openai_key", existing_type=sa.String(), nullable=True)

    bind = op.get_bind()
    sessions = sa.Table(
        "sessions",
        sa.MetaData(),
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("openai_key", sa.String),
    )
    bind.execute(sessions.update().values(openai_key=None))
