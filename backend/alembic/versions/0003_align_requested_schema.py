"""align requested schema

Revision ID: 0003_align_requested_schema
Revises: 0002_finding_workflow_fields
Create Date: 2026-04-03 16:25:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_align_requested_schema"
down_revision = "0002_finding_workflow_fields"
branch_labels = None
depends_on = None


def has_table(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def has_column(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if has_table(inspector, "workspace_memberships") and not has_table(inspector, "workspace_members"):
        op.rename_table("workspace_memberships", "workspace_members")
        inspector = sa.inspect(bind)

    if has_table(inspector, "scan_runs") and not has_table(inspector, "scans"):
        op.rename_table("scan_runs", "scans")
        inspector = sa.inspect(bind)

    if has_table(inspector, "findings") and not has_table(inspector, "issues"):
        op.rename_table("findings", "issues")
        inspector = sa.inspect(bind)

    if has_table(inspector, "remediations") and not has_table(inspector, "fixes"):
        op.rename_table("remediations", "fixes")
        inspector = sa.inspect(bind)

    if has_table(inspector, "users"):
        if not has_column(inspector, "users", "name"):
            op.add_column("users", sa.Column("name", sa.String(length=255), nullable=True))
        if has_column(inspector, "users", "full_name"):
            op.execute(sa.text("UPDATE users SET name = COALESCE(name, full_name)"))
        if not has_column(inspector, "users", "is_verified"):
            op.add_column("users", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")))
        if not has_column(inspector, "users", "role"):
            op.add_column("users", sa.Column("role", sa.String(length=32), nullable=False, server_default="viewer"))

    if has_table(inspector, "projects"):
        if not has_column(inspector, "projects", "target_type"):
            op.add_column("projects", sa.Column("target_type", sa.String(length=32), nullable=False, server_default="website"))
        if not has_column(inspector, "projects", "target_value"):
            op.add_column("projects", sa.Column("target_value", sa.Text(), nullable=True))
        if not has_column(inspector, "projects", "detected_stack"):
            op.add_column("projects", sa.Column("detected_stack", sa.Text(), nullable=True))

    if has_table(inspector, "scans"):
        if not has_column(inspector, "scans", "scan_mode"):
            op.add_column("scans", sa.Column("scan_mode", sa.String(length=32), nullable=False, server_default="full"))
        if not has_column(inspector, "scans", "started_at"):
            op.add_column("scans", sa.Column("started_at", sa.DateTime(), nullable=True))
        if not has_column(inspector, "scans", "completed_at"):
            op.add_column("scans", sa.Column("completed_at", sa.DateTime(), nullable=True))
        if not has_column(inspector, "scans", "summary_json"):
            op.add_column("scans", sa.Column("summary_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")))

    if has_table(inspector, "issues"):
        if not has_column(inspector, "issues", "evidence_json"):
            op.add_column("issues", sa.Column("evidence_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")))
        if not has_column(inspector, "issues", "location"):
            op.add_column("issues", sa.Column("location", sa.String(length=512), nullable=True))

    if has_table(inspector, "fixes"):
        if not has_column(inspector, "fixes", "issue_id"):
            op.add_column("fixes", sa.Column("issue_id", sa.String(length=32), nullable=True))
        if not has_column(inspector, "fixes", "language"):
            op.add_column("fixes", sa.Column("language", sa.String(length=32), nullable=True))
        if not has_column(inspector, "fixes", "fix_title"):
            op.add_column("fixes", sa.Column("fix_title", sa.String(length=255), nullable=True))
        if not has_column(inspector, "fixes", "code_before"):
            op.add_column("fixes", sa.Column("code_before", sa.Text(), nullable=True))
        if not has_column(inspector, "fixes", "code_after"):
            op.add_column("fixes", sa.Column("code_after", sa.Text(), nullable=True))
        if not has_column(inspector, "fixes", "config_patch"):
            op.add_column("fixes", sa.Column("config_patch", sa.Text(), nullable=True))
        if not has_column(inspector, "fixes", "manual_steps"):
            op.add_column("fixes", sa.Column("manual_steps", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
        if not has_column(inspector, "fixes", "confidence"):
            op.add_column("fixes", sa.Column("confidence", sa.Integer(), nullable=False, server_default="70"))

    if has_table(inspector, "reports"):
        if not has_column(inspector, "reports", "project_id"):
            op.add_column("reports", sa.Column("project_id", sa.String(length=32), nullable=True))
        if not has_column(inspector, "reports", "report_type"):
            op.add_column("reports", sa.Column("report_type", sa.String(length=32), nullable=False, server_default="developer"))
        if not has_column(inspector, "reports", "storage_url"):
            op.add_column("reports", sa.Column("storage_url", sa.String(length=1024), nullable=True))

    if has_table(inspector, "audit_logs") and has_column(inspector, "audit_logs", "actor_user_id") and not has_column(inspector, "audit_logs", "user_id"):
        op.add_column("audit_logs", sa.Column("user_id", sa.String(length=32), nullable=True))
        op.execute(sa.text("UPDATE audit_logs SET user_id = actor_user_id WHERE user_id IS NULL"))


def downgrade() -> None:
    return
