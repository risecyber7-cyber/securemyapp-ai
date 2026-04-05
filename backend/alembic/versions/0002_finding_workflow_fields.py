"""finding workflow fields

Revision ID: 0002_finding_workflow_fields
Revises: 0001_initial_schema
Create Date: 2026-04-03 00:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_finding_workflow_fields"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    target_table = "findings" if "findings" in inspector.get_table_names() else "issues" if "issues" in inspector.get_table_names() else None
    if not target_table:
        return

    existing_columns = {column["name"] for column in inspector.get_columns(target_table)}
    if "fix_available" not in existing_columns:
        op.add_column(target_table, sa.Column("fix_available", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    if "false_positive" not in existing_columns:
        op.add_column(target_table, sa.Column("false_positive", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    if "status" not in existing_columns:
        op.add_column(target_table, sa.Column("status", sa.String(length=32), nullable=False, server_default="open"))
    if "assigned_to_user_id" not in existing_columns:
        op.add_column(target_table, sa.Column("assigned_to_user_id", sa.String(length=32), nullable=True))
    if "business_impact" not in existing_columns:
        op.add_column(target_table, sa.Column("business_impact", sa.Text(), nullable=True))
    if "ai_notes" not in existing_columns:
        op.add_column(target_table, sa.Column("ai_notes", sa.Text(), nullable=True))

    fk_names = {fk["name"] for fk in inspector.get_foreign_keys(target_table)}
    if "fk_findings_assigned_to_user" not in fk_names:
        op.create_foreign_key(
            "fk_findings_assigned_to_user",
            target_table,
            "users",
            ["assigned_to_user_id"],
            ["id"],
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    target_table = "findings" if "findings" in inspector.get_table_names() else "issues" if "issues" in inspector.get_table_names() else None
    if not target_table:
        return
    fk_names = {fk["name"] for fk in inspector.get_foreign_keys(target_table)}
    if "fk_findings_assigned_to_user" in fk_names:
        op.drop_constraint("fk_findings_assigned_to_user", target_table, type_="foreignkey")
    existing_columns = {column["name"] for column in inspector.get_columns(target_table)}
    for column_name in ["ai_notes", "business_impact", "assigned_to_user_id", "status", "false_positive", "fix_available"]:
        if column_name in existing_columns:
            op.drop_column(target_table, column_name)
