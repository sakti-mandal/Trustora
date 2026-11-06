from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

# Companies
class CompanyBase(BaseModel):
    company_name: str
    industry: Optional[str] = None
    description: Optional[str] = None
    email_domain: Optional[str] = "novatech.io"

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    email_domain: Optional[str] = None

class CompanyOut(CompanyBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Users
class UserBase(BaseModel):
    full_name: str
    email: str
    role: str = "Content Creator"
    company_id: int

class UserCreate(UserBase):
    password: Optional[str] = None

class UserAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class LoginResponse(BaseModel):
    user: "UserOut"
    token: str
    message: str

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None
    has_password: Optional[bool] = False
    model_config = ConfigDict(from_attributes=True)

# Brand Guidelines
class BrandGuidelineBase(BaseModel):
    document_name: str
    extracted_text: Optional[str] = None
    processing_status: Optional[str] = "processed"

class BrandGuidelineCreate(BrandGuidelineBase):
    company_id: int

class BrandGuidelineOut(BrandGuidelineBase):
    id: int
    company_id: int
    file_path: Optional[str] = None
    upload_date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Brand Rules
class BrandRuleBase(BaseModel):
    rule_type: str
    rule_description: str
    rule_value: Optional[str] = None
    severity: Optional[str] = "Medium"

class BrandRuleCreate(BrandRuleBase):
    company_id: int

class BrandRuleUpdate(BaseModel):
    rule_type: Optional[str] = None
    rule_description: Optional[str] = None
    rule_value: Optional[str] = None
    severity: Optional[str] = None

class BrandRuleOut(BrandRuleBase):
    id: int
    company_id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# AI Findings
class AIFindingBase(BaseModel):
    issue_category: str
    severity: str
    problematic_text: str
    explanation: str
    guideline_reference: Optional[str] = None
    suggested_correction: Optional[str] = None
    verification_status: Optional[str] = "Verified against Guidelines"

class AIFindingOut(AIFindingBase):
    id: int
    submission_id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Content Submissions
class ContentSubmissionCreate(BaseModel):
    company_id: int
    title: str
    content_type: str
    original_content: str
    submitted_by: Optional[int] = 1

class ContentSubmissionUpdate(BaseModel):
    title: Optional[str] = None
    revised_content: Optional[str] = None
    status: Optional[str] = None

class ReviewDecisionCreate(BaseModel):
    decision: str  # Approved, Rejected, Changes Requested
    review_comment: Optional[str] = ""
    reviewer_id: Optional[int] = 1

class ReviewDecisionOut(BaseModel):
    id: int
    submission_id: int
    reviewer_id: Optional[int] = None
    decision: str
    review_comment: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ReviewHistoryOut(BaseModel):
    id: int
    submission_id: int
    action: str
    previous_content: Optional[str] = None
    updated_content: Optional[str] = None
    performed_by: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ContentSubmissionOut(BaseModel):
    id: int
    company_id: int
    submitted_by: Optional[int] = None
    title: str
    content_type: str
    original_content: str
    revised_content: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    findings: List[AIFindingOut] = []
    decisions: List[ReviewDecisionOut] = []
    history: List[ReviewHistoryOut] = []
    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_submissions: int
    approved_content: int
    pending_reviews: int
    flagged_content: int
    recent_activity: List[Any] = []
    recent_submissions: List[ContentSubmissionOut] = []

class NotificationOut(BaseModel):
    id: int
    company_id: int
    submission_id: Optional[int] = None
    recipient_role: str
    title: str
    message: str
    notification_type: str
    is_read: bool = False
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

