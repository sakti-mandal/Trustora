from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    email_domain = Column(String(255), default="novatech.io", nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    guidelines = relationship("BrandGuideline", back_populates="company", cascade="all, delete-orphan")
    rules = relationship("BrandRule", back_populates="company", cascade="all, delete-orphan")
    submissions = relationship("ContentSubmission", back_populates="company", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="Creator")  # Admin, Creator, Reviewer
    created_at = Column(DateTime, default=utcnow)

    company = relationship("Company", back_populates="users")


class BrandGuideline(Base):
    __tablename__ = "brand_guidelines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    document_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    extracted_text = Column(Text, nullable=True)
    upload_date = Column(DateTime, default=utcnow)
    processing_status = Column(String(50), default="processed")  # processing, processed, error

    company = relationship("Company", back_populates="guidelines")


class BrandRule(Base):
    __tablename__ = "brand_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    rule_type = Column(String(100), nullable=False)  # Tone, Prohibited Term, Preferred Term, Approved Fact, Communication Standard
    rule_description = Column(Text, nullable=False)
    rule_value = Column(Text, nullable=True)  # Term value or replacement value
    severity = Column(String(50), default="Medium")  # High, Medium, Low
    created_at = Column(DateTime, default=utcnow)

    company = relationship("Company", back_populates="rules")


class ContentSubmission(Base):
    __tablename__ = "content_submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    submitted_by = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)  # Advertisement, Social Media Post, Blog, Product Description, Email
    original_content = Column(Text, nullable=False)
    revised_content = Column(Text, nullable=True)
    status = Column(String(50), default="Draft")  # Draft, Analysing, Needs Changes, Pending Review, Approved, Rejected
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    company = relationship("Company", back_populates="submissions")
    findings = relationship("AIFinding", back_populates="submission", cascade="all, delete-orphan")
    decisions = relationship("ReviewDecision", back_populates="submission", cascade="all, delete-orphan")
    history = relationship("ReviewHistory", back_populates="submission", cascade="all, delete-orphan")


class AIFinding(Base):
    __tablename__ = "ai_findings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False)
    issue_category = Column(String(100), nullable=False)
    # Brand Tone Mismatch, Prohibited Terminology, Missing Required Terminology,
    # Unsupported or Unverified Claims, Inconsistent Brand Information, Grammar and Readability Suggestions
    severity = Column(String(50), default="Medium")  # High, Medium, Low
    problematic_text = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    guideline_reference = Column(Text, nullable=True)
    suggested_correction = Column(Text, nullable=True)
    verification_status = Column(String(100), default="Verified against Guidelines")  # Verified against Guidelines, Unverified – Human Review Required
    created_at = Column(DateTime, default=utcnow)

    submission = relationship("ContentSubmission", back_populates="findings")


class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, nullable=True)
    decision = Column(String(50), nullable=False)  # Approved, Rejected, Changes Requested
    review_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    submission = relationship("ContentSubmission", back_populates="decisions")


class ReviewHistory(Base):
    __tablename__ = "review_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    submission_id = Column(Integer, ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False)  # Created, Analyzed, Revised, Submitted for Review, Approved, Rejected, Changes Requested
    previous_content = Column(Text, nullable=True)
    updated_content = Column(Text, nullable=True)
    performed_by = Column(String(100), default="Content Creator")
    created_at = Column(DateTime, default=utcnow)

    submission = relationship("ContentSubmission", back_populates="history")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    submission_id = Column(Integer, ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=True)
    recipient_role = Column(String(50), nullable=False)  # "Reviewer", "Content Creator", "Admin"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # "review_request", "changes_requested", "approved", "rejected"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    company = relationship("Company", back_populates="notifications")
    submission = relationship("ContentSubmission")

