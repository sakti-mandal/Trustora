"""Initial schema for Trustora Brand Governance Platform

Revision ID: 1ca6dd3ec209
Revises: 
Create Date: 2026-11-05 19:48:09.765362

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1ca6dd3ec209'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Companies
    op.create_table(
        'companies',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('industry', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_companies_id'), 'companies', ['id'], unique=False)

    # 2. Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 3. Brand Guidelines
    op.create_table(
        'brand_guidelines',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('document_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=True),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('upload_date', sa.DateTime(), nullable=True),
        sa.Column('processing_status', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_brand_guidelines_id'), 'brand_guidelines', ['id'], unique=False)

    # 4. Brand Rules
    op.create_table(
        'brand_rules',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('rule_type', sa.String(length=100), nullable=False),
        sa.Column('rule_description', sa.Text(), nullable=False),
        sa.Column('rule_value', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_brand_rules_id'), 'brand_rules', ['id'], unique=False)

    # 5. Content Submissions
    op.create_table(
        'content_submissions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('submitted_by', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content_type', sa.String(length=100), nullable=False),
        sa.Column('original_content', sa.Text(), nullable=False),
        sa.Column('revised_content', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_content_submissions_id'), 'content_submissions', ['id'], unique=False)

    # 6. AI Findings
    op.create_table(
        'ai_findings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('submission_id', sa.Integer(), nullable=False),
        sa.Column('issue_category', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=True),
        sa.Column('problematic_text', sa.Text(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('guideline_reference', sa.Text(), nullable=True),
        sa.Column('suggested_correction', sa.Text(), nullable=True),
        sa.Column('verification_status', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['submission_id'], ['content_submissions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_findings_id'), 'ai_findings', ['id'], unique=False)

    # 7. Review Decisions
    op.create_table(
        'review_decisions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('submission_id', sa.Integer(), nullable=False),
        sa.Column('reviewer_id', sa.Integer(), nullable=True),
        sa.Column('decision', sa.String(length=50), nullable=False),
        sa.Column('review_comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['submission_id'], ['content_submissions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_review_decisions_id'), 'review_decisions', ['id'], unique=False)

    # 8. Review History
    op.create_table(
        'review_history',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('submission_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('previous_content', sa.Text(), nullable=True),
        sa.Column('updated_content', sa.Text(), nullable=True),
        sa.Column('performed_by', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['submission_id'], ['content_submissions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_review_history_id'), 'review_history', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('review_history')
    op.drop_table('review_decisions')
    op.drop_table('ai_findings')
    op.drop_table('content_submissions')
    op.drop_table('brand_rules')
    op.drop_table('brand_guidelines')
    op.drop_table('users')
    op.drop_table('companies')
