import os
import shutil
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.config import UPLOAD_DIR, GEMINI_API_KEY, DATABASE_URL
from backend.database import engine, get_db, Base
from backend.models import (
    Company, User, BrandGuideline, BrandRule, ContentSubmission,
    AIFinding, ReviewDecision, ReviewHistory, Notification
)
from backend.schemas import (
    CompanyCreate, CompanyUpdate, CompanyOut, UserCreate, UserAdminUpdate, UserOut,
    LoginRequest, LoginResponse,
    BrandGuidelineOut, BrandRuleCreate, BrandRuleUpdate, BrandRuleOut,
    ContentSubmissionCreate, ContentSubmissionUpdate, ContentSubmissionOut,
    AIFindingOut, ReviewDecisionCreate, ReviewDecisionOut, ReviewHistoryOut,
    DashboardStats, NotificationOut
)
from backend.document_processor import extract_document_text, chunk_text
from backend.rag_service import (
    register_company_chunks, retrieve_relevant_guidelines,
    clear_company_knowledge, analyzer
)
from backend.seed_data import seed_nova_tech

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TRUSTORA API",
    description="AI-Powered Brand Governance Platform Backend",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite port 5173 and any local/remote host)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Support both /api/path and /path interchangeably (crucial for Vercel & proxy environments)
@app.middleware("http")
async def api_prefix_middleware(request: Request, call_next):
    path = request.url.path
    if path.startswith("/api/") and not path.startswith("/api/docs") and not path.startswith("/api/openapi.json"):
        request.scope["path"] = path[4:]
    return await call_next(request)


@app.on_event("startup")
def startup_event():
    # Seed NOVA TECH demo data on startup if not already seeded
    db = next(get_db())
    try:
        seed_nova_tech(db)
    except Exception as e:
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()


# ---------------- SYSTEM / HEALTH ----------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": "TRUSTORA Brand Governance Platform",
        "database": "PostgreSQL" if "postgresql" in DATABASE_URL else "SQLite (Local/Demo)",
        "gemini_api_configured": bool(GEMINI_API_KEY and GEMINI_API_KEY.strip()),
        "mode": "AI Gemini RAG Mode" if (GEMINI_API_KEY and GEMINI_API_KEY.strip()) else "Rule-Based Demo Mode"
    }



# ---------------- COMPANIES ----------------
@app.get("/companies", response_model=List[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.id).all()


@app.post("/companies", response_model=CompanyOut)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    company = Company(
        company_name=payload.company_name,
        industry=payload.industry
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@app.put("/companies/{company_id}", response_model=CompanyOut)
def update_company(company_id: int, payload: CompanyUpdate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if payload.company_name is not None:
        company.company_name = payload.company_name
    if payload.industry is not None:
        company.industry = payload.industry
    if payload.description is not None:
        company.description = payload.description
    if payload.email_domain is not None:
        clean_domain = payload.email_domain.strip().lstrip("@").lower()
        company.email_domain = clean_domain
    db.commit()
    db.refresh(company)
    return company


@app.post("/companies/{company_id}/load-demo")
def load_demo_data(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    company = seed_nova_tech(db)
    return {
        "message": "NOVA TECH demo data loaded successfully",
        "company_id": company.id,
        "company_name": company.company_name
    }


# ---------------- USERS & AUTH (ORGANIZATION DOMAIN & ROLE PROVISIONING) ----------------
@app.get("/auth/users", response_model=List[UserOut])
def list_users(company_id: int = Query(1), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.company_id == company_id).order_by(User.id.asc()).all()
    result = []
    for u in users:
        result.append(UserOut(
            id=u.id,
            company_id=u.company_id,
            full_name=u.full_name,
            email=u.email,
            role=u.role,
            created_at=u.created_at,
            has_password=bool(u.password_hash)
        ))
    return result


@app.post("/auth/users", response_model=UserOut)
@app.post("/auth/register", response_model=UserOut)
def create_or_register_user(payload: UserCreate, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="A valid email address with domain is required")
    
    # Check for existing email in company
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"User with email '{clean_email}' already exists.")

    # Normalize role
    requested_role = payload.role or "Content Creator"
    lower_role = requested_role.lower()
    if "admin" in lower_role:
        norm_role = "Admin"
    elif "approv" in lower_role or "review" in lower_role:
        norm_role = "Reviewer"
    else:
        norm_role = "Content Creator"

    # Set password
    raw_password = (payload.password or "").strip()
    if not raw_password:
        raw_password = "trustora123"

    user = User(
        company_id=payload.company_id or 1,
        full_name=payload.full_name.strip() or clean_email.split("@")[0].title(),
        email=clean_email,
        password_hash=raw_password,
        role=norm_role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut(
        id=user.id,
        company_id=user.company_id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        has_password=True
    )


@app.put("/auth/users/{user_id}", response_model=UserOut)
def update_user_credentials(user_id: int, payload: UserAdminUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.full_name is not None and payload.full_name.strip():
        user.full_name = payload.full_name.strip()

    if payload.email is not None and payload.email.strip():
        clean_email = payload.email.strip().lower()
        # Verify no duplicate email
        dup = db.query(User).filter(User.email.ilike(clean_email), User.id != user_id).first()
        if dup:
            raise HTTPException(status_code=400, detail=f"Email '{clean_email}' is already in use by another user.")
        user.email = clean_email

    if payload.role is not None and payload.role.strip():
        lower_role = payload.role.lower()
        if "admin" in lower_role:
            user.role = "Admin"
        elif "approv" in lower_role or "review" in lower_role:
            user.role = "Reviewer"
        else:
            user.role = "Content Creator"

    if payload.password is not None and payload.password.strip():
        user.password_hash = payload.password.strip()

    db.commit()
    db.refresh(user)

    return UserOut(
        id=user.id,
        company_id=user.company_id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
        has_password=bool(user.password_hash)
    )


@app.delete("/auth/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "Admin":
        admin_count = db.query(User).filter(User.company_id == user.company_id, User.role == "Admin").count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the primary organization Administrator account.")

    user_name = user.full_name
    user_email = user.email
    db.delete(user)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully removed account for {user_name} ({user_email})",
        "id": user_id
    }


@app.post("/auth/login", response_model=LoginResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    password = payload.password.strip()

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not password:
        raise HTTPException(status_code=400, detail="Password is required")

    # Map role selection: Admin, Creator, Approval / Approver / Reviewer
    requested_role = payload.role or "Content Creator"
    lower_role = requested_role.lower()
    if "admin" in lower_role:
        norm_role = "Admin"
    elif "approv" in lower_role or "review" in lower_role:
        norm_role = "Reviewer"
    else:
        norm_role = "Content Creator"

    # Get active company safely
    company = db.query(Company).first()
    if not company:
        company = seed_nova_tech(db)
    active_comp_id = company.id if company else 1

    # Check if demo account
    is_demo_email = email in ["admin@novatech.io", "creator@novatech.io", "reviewer@novatech.io"]

    # Find user in DB
    user = db.query(User).filter(User.email.ilike(email)).first()
    if not user:
        # Auto-provision new evaluator user account
        name_part = email.split("@")[0].replace(".", " ").title()
        user = User(
            company_id=active_comp_id,
            full_name=name_part or f"{norm_role} User",
            email=email,
            password_hash=password,
            role=norm_role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Check credentials
        if is_demo_email:
            # Demo profiles accept default "trustora123" or matching password
            if user.password_hash and user.password_hash != password and password != "trustora123":
                # If evaluator typed a custom password on a demo profile, allow & update
                user.password_hash = password
                db.commit()
        else:
            # Custom admin-created accounts strictly verify password
            if user.password_hash and user.password_hash != password:
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid password for {user.email}. Please verify the credentials issued by your Administrator."
                )

        if not user.password_hash:
            user.password_hash = password or "trustora123"
            db.commit()

        # If user explicitly switched role on login screen, update role for convenience
        if payload.role and (is_demo_email or user.email.endswith(".test")):
            user.role = norm_role
            db.commit()
            db.refresh(user)

    return {
        "user": UserOut(
            id=user.id,
            company_id=user.company_id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
            has_password=True
        ),
        "token": f"trustora-auth-session-{user.id}",
        "message": f"Successfully logged in as {user.role}"
    }


# ---------------- BRAND GUIDELINES ----------------
@app.get("/guidelines", response_model=List[BrandGuidelineOut])
def list_guidelines(company_id: int = Query(1), db: Session = Depends(get_db)):
    return db.query(BrandGuideline).filter(BrandGuideline.company_id == company_id).order_by(desc(BrandGuideline.id)).all()


@app.get("/guidelines/{guideline_id}", response_model=BrandGuidelineOut)
def get_guideline(guideline_id: int, db: Session = Depends(get_db)):
    gl = db.query(BrandGuideline).filter(BrandGuideline.id == guideline_id).first()
    if not gl:
        raise HTTPException(status_code=404, detail="Guideline not found")
    return gl


@app.post("/guidelines/upload", response_model=BrandGuidelineOut)
def upload_guideline(
    file: UploadFile = File(...),
    company_id: int = Form(1),
    db: Session = Depends(get_db)
):
    # Validate extension
    filename = file.filename or "uploaded_guideline"
    valid_exts = [".pdf", ".docx", ".doc", ".txt", ".md"]
    ext = os.path.splitext(filename)[1].lower()
    if ext not in valid_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload PDF, DOCX, or TXT."
        )

    # Save to disk
    save_path = UPLOAD_DIR / f"{company_id}_{filename}"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    extracted_text = extract_document_text(str(save_path), filename)

    guideline = BrandGuideline(
        company_id=company_id,
        document_name=filename,
        file_path=str(save_path),
        extracted_text=extracted_text,
        processing_status="processed"
    )
    db.add(guideline)
    db.commit()
    db.refresh(guideline)

    # Chunk and register into RAG knowledge store
    chunks = chunk_text(extracted_text, filename, chunk_size=150, overlap=30)
    register_company_chunks(company_id, chunks)

    return guideline


@app.delete("/guidelines/{guideline_id}")
def delete_guideline(guideline_id: int, db: Session = Depends(get_db)):
    gl = db.query(BrandGuideline).filter(BrandGuideline.id == guideline_id).first()
    if not gl:
        raise HTTPException(status_code=404, detail="Guideline not found")
    
    # Try deleting physical file if exists
    if gl.file_path and os.path.exists(gl.file_path):
        try:
            os.remove(gl.file_path)
        except Exception:
            pass

    db.delete(gl)
    db.commit()
    return {"message": "Guideline deleted successfully"}


# ---------------- BRAND RULES ----------------
@app.get("/brand-rules", response_model=List[BrandRuleOut])
def list_brand_rules(company_id: int = Query(1), db: Session = Depends(get_db)):
    return db.query(BrandRule).filter(BrandRule.company_id == company_id).order_by(desc(BrandRule.id)).all()


@app.post("/brand-rules", response_model=BrandRuleOut)
def create_brand_rule(payload: BrandRuleCreate, db: Session = Depends(get_db)):
    rule = BrandRule(
        company_id=payload.company_id,
        rule_type=payload.rule_type,
        rule_description=payload.rule_description,
        rule_value=payload.rule_value,
        severity=payload.severity or "Medium"
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@app.put("/brand-rules/{rule_id}", response_model=BrandRuleOut)
def update_brand_rule(rule_id: int, payload: BrandRuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(BrandRule).filter(BrandRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    if payload.rule_type is not None:
        rule.rule_type = payload.rule_type
    if payload.rule_description is not None:
        rule.rule_description = payload.rule_description
    if payload.rule_value is not None:
        rule.rule_value = payload.rule_value
    if payload.severity is not None:
        rule.severity = payload.severity

    db.commit()
    db.refresh(rule)
    return rule


@app.delete("/brand-rules/{rule_id}")
def delete_brand_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(BrandRule).filter(BrandRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Brand rule deleted successfully"}


# ---------------- CONTENT SUBMISSIONS ----------------
@app.get("/content", response_model=List[ContentSubmissionOut])
def list_content(
    company_id: int = Query(1),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ContentSubmission).filter(ContentSubmission.company_id == company_id)
    if status:
        query = query.filter(ContentSubmission.status == status)
    return query.order_by(desc(ContentSubmission.id)).all()


@app.post("/content/submit", response_model=ContentSubmissionOut)
def create_content_submission(payload: ContentSubmissionCreate, db: Session = Depends(get_db)):
    sub = ContentSubmission(
        company_id=payload.company_id,
        submitted_by=payload.submitted_by,
        title=payload.title,
        content_type=payload.content_type,
        original_content=payload.original_content,
        revised_content=payload.original_content,
        status="Draft"
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    # Add audit log
    history = ReviewHistory(
        submission_id=sub.id,
        action="Created",
        previous_content=None,
        updated_content=payload.original_content,
        performed_by="Content Creator"
    )
    db.add(history)
    db.commit()

    return sub


@app.get("/content/{content_id}", response_model=ContentSubmissionOut)
def get_content_submission(content_id: int, db: Session = Depends(get_db)):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == content_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub


@app.put("/content/{content_id}", response_model=ContentSubmissionOut)
def update_content_submission(
    content_id: int,
    payload: ContentSubmissionUpdate,
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == content_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    prev_text = sub.revised_content or sub.original_content

    if payload.title is not None:
        sub.title = payload.title
    if payload.revised_content is not None:
        sub.revised_content = payload.revised_content
    if payload.status is not None:
        sub.status = payload.status

    sub.updated_at = datetime.now(timezone.utc)
    
    # Audit trail
    history = ReviewHistory(
        submission_id=sub.id,
        action="Revised",
        previous_content=prev_text,
        updated_content=sub.revised_content,
        performed_by="Content Creator"
    )
    db.add(history)
    db.commit()
    db.refresh(sub)
    return sub


# ---------------- AI ANALYSIS (RAG) ----------------
@app.post("/content/{content_id}/analyze")
def analyze_content(content_id: int, db: Session = Depends(get_db)):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == content_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    content_to_check = sub.revised_content or sub.original_content

    # 1. Fetch Company Brand Rules
    rules = db.query(BrandRule).filter(BrandRule.company_id == sub.company_id).all()
    rules_data = [
        {
            "id": r.id,
            "rule_type": r.rule_type,
            "rule_description": r.rule_description,
            "rule_value": r.rule_value,
            "severity": r.severity
        }
        for r in rules
    ]

    # 2. Retrieve relevant guidelines via vector search
    retrieved_chunks = retrieve_relevant_guidelines(
        company_id=sub.company_id,
        query_text=content_to_check,
        top_k=5
    )

    # If no chunks were stored in memory yet (e.g. from server restart), load from DB guidelines
    if not retrieved_chunks:
        db_guidelines = db.query(BrandGuideline).filter(BrandGuideline.company_id == sub.company_id).all()
        for gl in db_guidelines:
            if gl.extracted_text:
                chunks = chunk_text(gl.extracted_text, gl.document_name, chunk_size=150, overlap=30)
                register_company_chunks(sub.company_id, chunks)
        # re-query
        retrieved_chunks = retrieve_relevant_guidelines(
            company_id=sub.company_id,
            query_text=content_to_check,
            top_k=5
        )

    # 3. Run Hybrid Governance Analysis
    result = analyzer.analyze(
        company_id=sub.company_id,
        content=content_to_check,
        content_type=sub.content_type,
        title=sub.title,
        brand_rules=rules_data,
        guidelines_context=retrieved_chunks
    )

    # 4. Clear old findings and save new findings to DB
    db.query(AIFinding).filter(AIFinding.submission_id == sub.id).delete()
    
    findings_objects = []
    for f in result["findings"]:
        finding_obj = AIFinding(
            submission_id=sub.id,
            issue_category=f["issue_category"],
            severity=f["severity"],
            problematic_text=f["problematic_text"],
            explanation=f["explanation"],
            guideline_reference=f.get("guideline_reference"),
            suggested_correction=f.get("suggested_correction"),
            verification_status=f.get("verification_status", "Verified against Guidelines")
        )
        db.add(finding_obj)
        findings_objects.append(finding_obj)

    # Update submission status
    if len(result["findings"]) > 0:
        sub.status = "Needs Changes"
    else:
        sub.status = "Pending Review"

    # Add history log
    history = ReviewHistory(
        submission_id=sub.id,
        action="Analyzed",
        previous_content=content_to_check,
        updated_content=content_to_check,
        performed_by=f"TRUSTORA AI ({result['mode']})"
    )
    db.add(history)
    db.commit()
    db.refresh(sub)

    return {
        "submission_id": sub.id,
        "status": sub.status,
        "mode": result["mode"],
        "is_demo_mode": result["is_demo_mode"],
        "retrieved_guidelines_count": len(retrieved_chunks),
        "total_issues": len(result["findings"]),
        "findings": [
            {
                "id": f.id,
                "issue_category": f.issue_category,
                "severity": f.severity,
                "problematic_text": f.problematic_text,
                "explanation": f.explanation,
                "guideline_reference": f.guideline_reference,
                "suggested_correction": f.suggested_correction,
                "verification_status": f.verification_status
            }
            for f in sub.findings
        ]
    }


@app.get("/content/{content_id}/findings", response_model=List[AIFindingOut])
def get_content_findings(content_id: int, db: Session = Depends(get_db)):
    return db.query(AIFinding).filter(AIFinding.submission_id == content_id).all()


# ---------------- REVIEW & DECISION WORKFLOW ----------------
@app.post("/content/{content_id}/submit-review", response_model=ContentSubmissionOut)
def submit_for_review(content_id: int, db: Session = Depends(get_db)):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == content_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    sub.status = "Pending Review"
    sub.updated_at = datetime.now(timezone.utc)

    history = ReviewHistory(
        submission_id=sub.id,
        action="Submitted for Review",
        previous_content=sub.original_content,
        updated_content=sub.revised_content,
        performed_by="Content Creator"
    )
    db.add(history)

    # Notification for Reviewer
    notif = Notification(
        company_id=sub.company_id,
        submission_id=sub.id,
        recipient_role="Reviewer",
        title="Review Request Submitted",
        message=f"New marketing copy '{sub.title}' ({sub.content_type}) has been submitted for governance review.",
        notification_type="review_request"
    )
    db.add(notif)

    db.commit()
    db.refresh(sub)
    return sub


@app.post("/content/{content_id}/approve", response_model=ContentSubmissionOut)
def approve_content(
    content_id: int,
    payload: ReviewDecisionCreate,
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == content_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = "Approved"
    sub.updated_at = datetime.now(timezone.utc)

    decision_comment = payload.review_comment or "Content adheres to brand governance guidelines. Approved for publishing."
    decision = ReviewDecision(
        submission_id=sub.id,
        reviewer_id=payload.reviewer_id,
        decision="Approved",
        review_comment=decision_comment
    )
    db.add(decision)

    history = ReviewHistory(
        submission_id=sub.id,
        action="Approved",
        previous_content=sub.original_content,
        updated_content=sub.revised_content,
        performed_by="Elena Rostova (Reviewer)"
    )
    db.add(history)

    # Notification for Content Creator
    notif = Notification(
        company_id=sub.company_id,
        submission_id=sub.id,
        recipient_role="Content Creator",
        title="Content Approved",
        message=f"'{sub.title}' was approved by Reviewer: {decision_comment}",
        notification_type="approved"
    )
    db.add(notif)

    db.commit()
    db.refresh(sub)
    return sub


@app.post("/content/{content_id}/reject", response_model=ContentSubmissionOut)
def reject_content(
    content_id: int,
    payload: ReviewDecisionCreate,
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == content_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = "Rejected"
    sub.updated_at = datetime.now(timezone.utc)

    decision_comment = payload.review_comment or "Rejected due to brand non-compliance."
    decision = ReviewDecision(
        submission_id=sub.id,
        reviewer_id=payload.reviewer_id,
        decision="Rejected",
        review_comment=decision_comment
    )
    db.add(decision)

    history = ReviewHistory(
        submission_id=sub.id,
        action="Rejected",
        previous_content=sub.original_content,
        updated_content=sub.revised_content,
        performed_by="Elena Rostova (Reviewer)"
    )
    db.add(history)

    # Notification for Content Creator
    notif = Notification(
        company_id=sub.company_id,
        submission_id=sub.id,
        recipient_role="Content Creator",
        title="Content Rejected",
        message=f"'{sub.title}' was rejected by Reviewer: {decision_comment}",
        notification_type="rejected"
    )
    db.add(notif)

    db.commit()
    db.refresh(sub)
    return sub


@app.post("/content/{content_id}/request-changes", response_model=ContentSubmissionOut)
def request_changes(
    content_id: int,
    payload: ReviewDecisionCreate,
    db: Session = Depends(get_db)
):
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == content_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    sub.status = "Needs Changes"
    sub.updated_at = datetime.now(timezone.utc)

    decision_comment = payload.review_comment or "Please revise flagged terminology and claims before publishing."
    decision = ReviewDecision(
        submission_id=sub.id,
        reviewer_id=payload.reviewer_id,
        decision="Changes Requested",
        review_comment=decision_comment
    )
    db.add(decision)

    history = ReviewHistory(
        submission_id=sub.id,
        action="Changes Requested",
        previous_content=sub.original_content,
        updated_content=sub.revised_content,
        performed_by="Elena Rostova (Reviewer)"
    )
    db.add(history)

    # Notification for Content Creator with the Reviewer's comment!
    notif = Notification(
        company_id=sub.company_id,
        submission_id=sub.id,
        recipient_role="Content Creator",
        title="Changes Requested by Reviewer",
        message=f"Reviewer requested revisions on '{sub.title}': \"{decision_comment}\"",
        notification_type="changes_requested"
    )
    db.add(notif)

    db.commit()
    db.refresh(sub)
    return sub


# ---------------- NOTIFICATIONS ----------------
@app.get("/notifications", response_model=List[NotificationOut])
def list_notifications(
    company_id: int = Query(1),
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.company_id == company_id)
    if role:
        query = query.filter(Notification.recipient_role == role)
    return query.order_by(desc(Notification.id)).limit(20).all()


@app.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}



@app.get("/content/{content_id}/history", response_model=List[ReviewHistoryOut])
def get_submission_history(content_id: int, db: Session = Depends(get_db)):
    return db.query(ReviewHistory).filter(ReviewHistory.submission_id == content_id).order_by(desc(ReviewHistory.id)).all()


# ---------------- COMPLIANCE SCORE METER ----------------
def get_score_color(score: Optional[int]) -> str:
    if score is None:
        return "slate"
    if score >= 90:
        return "emerald"
    elif score >= 75:
        return "blue"
    elif score >= 50:
        return "amber"
    else:
        return "rose"


def compute_submission_score_data(sub):
    if not sub:
        return None
    # Check if submission was ever analyzed
    has_analyzed_history = any(h.action == "Analyzed" for h in sub.history) if sub.history else False
    if not has_analyzed_history and sub.status == "Draft" and not sub.findings:
        return None

    score = 100
    category_scores = {
        "brand_tone": 100,
        "approved_facts": 100,
        "preferred_terms": 100,
        "prohibited_terms": 100,
        "brand_guidelines": 100
    }

    for f in sub.findings:
        sev = f.severity or "Medium"
        cat = (f.issue_category or "").lower()
        deduction = 20 if sev == "High" else 10 if sev == "Medium" else 5
        score -= deduction

        if "tone" in cat:
            category_scores["brand_tone"] = max(0, category_scores["brand_tone"] - deduction)
        elif "unsupported" in cat or "claim" in cat or "fact" in cat:
            category_scores["approved_facts"] = max(0, category_scores["approved_facts"] - deduction)
        elif "preferred" in cat:
            category_scores["preferred_terms"] = max(0, category_scores["preferred_terms"] - deduction)
        elif "prohibited" in cat:
            category_scores["prohibited_terms"] = max(0, category_scores["prohibited_terms"] - deduction)
        else:
            category_scores["brand_guidelines"] = max(0, category_scores["brand_guidelines"] - deduction)

    score = max(0, min(100, score))
    return {
        "overall_score": score,
        "category_scores": category_scores,
        "last_analyzed": (sub.updated_at or sub.created_at).isoformat() if (sub.updated_at or sub.created_at) else None,
        "submission_title": sub.title
    }


@app.get("/compliance/score")
def get_compliance_score(
    company_id: int = Query(1),
    role: str = Query("Content Creator"),
    submission_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns actual role-based Brand Compliance Score:
    - Content Creator: Selected submission score
    - Reviewer: Currently reviewed submission score
    - Admin: Company average score across all analyzed submissions
    """
    actual_company_id = company_id if isinstance(company_id, int) else 1
    actual_role = role if isinstance(role, str) else "Content Creator"
    actual_sub_id = submission_id if isinstance(submission_id, int) else None

    # 1. ADMIN ROLE: Average across company
    if actual_role == "Admin":
        all_subs = db.query(ContentSubmission).filter(ContentSubmission.company_id == actual_company_id).all()
        scored_items = []
        for s in all_subs:
            sc = compute_submission_score_data(s)
            if sc:
                scored_items.append(sc)

        if not scored_items:
            return {
                "role": "Admin",
                "has_score": False,
                "overall_score": None,
                "status_label": "Not Analysed",
                "color": "slate",
                "category_scores": None,
                "last_analyzed": None,
                "submission_title": "No submissions analysed yet"
            }

        avg_overall = round(sum(item["overall_score"] for item in scored_items) / len(scored_items))
        avg_categories = {
            "brand_tone": round(sum(item["category_scores"]["brand_tone"] for item in scored_items) / len(scored_items)),
            "approved_facts": round(sum(item["category_scores"]["approved_facts"] for item in scored_items) / len(scored_items)),
            "preferred_terms": round(sum(item["category_scores"]["preferred_terms"] for item in scored_items) / len(scored_items)),
            "prohibited_terms": round(sum(item["category_scores"]["prohibited_terms"] for item in scored_items) / len(scored_items)),
            "brand_guidelines": round(sum(item["category_scores"]["brand_guidelines"] for item in scored_items) / len(scored_items))
        }
        latest_date = max(item["last_analyzed"] for item in scored_items if item["last_analyzed"])

        return {
            "role": "Admin",
            "has_score": True,
            "overall_score": avg_overall,
            "status_label": "Brand Compliance (Company Average)",
            "color": get_score_color(avg_overall),
            "category_scores": avg_categories,
            "last_analyzed": latest_date,
            "submission_title": f"Company Average ({len(scored_items)} audited submissions)"
        }

    # 2. CONTENT CREATOR & REVIEWER ROLES: Selected Submission
    target_sub = None
    if actual_sub_id:
        target_sub = db.query(ContentSubmission).filter(
            ContentSubmission.id == actual_sub_id,
            ContentSubmission.company_id == actual_company_id
        ).first()

    if not target_sub:
        if actual_role == "Reviewer":
            # Priority to pending reviews
            target_sub = db.query(ContentSubmission).filter(
                ContentSubmission.company_id == actual_company_id,
                ContentSubmission.status == "Pending Review"
            ).order_by(desc(ContentSubmission.updated_at)).first()

        if not target_sub:
            # Fallback to latest updated submission
            target_sub = db.query(ContentSubmission).filter(
                ContentSubmission.company_id == actual_company_id
            ).order_by(desc(ContentSubmission.updated_at)).first()

    if not target_sub:
        return {
            "role": actual_role,
            "has_score": False,
            "overall_score": None,
            "status_label": "Not Analysed",
            "color": "slate",
            "category_scores": None,
            "last_analyzed": None,
            "submission_title": "No submission"
        }

    score_data = compute_submission_score_data(target_sub)
    if not score_data:
        return {
            "role": actual_role,
            "has_score": False,
            "overall_score": None,
            "status_label": "Not Analysed",
            "color": "slate",
            "category_scores": None,
            "last_analyzed": None,
            "submission_title": target_sub.title
        }

    return {
        "role": actual_role,
        "has_score": True,
        "overall_score": score_data["overall_score"],
        "status_label": "Brand Compliance",
        "color": get_score_color(score_data["overall_score"]),
        "category_scores": score_data["category_scores"],
        "last_analyzed": score_data["last_analyzed"],
        "submission_title": score_data["submission_title"]
    }


# ---------------- DASHBOARD STATS ----------------
@app.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(company_id: int = Query(1), db: Session = Depends(get_db)):
    total = db.query(ContentSubmission).filter(ContentSubmission.company_id == company_id).count()
    approved = db.query(ContentSubmission).filter(
        ContentSubmission.company_id == company_id,
        ContentSubmission.status == "Approved"
    ).count()
    pending = db.query(ContentSubmission).filter(
        ContentSubmission.company_id == company_id,
        ContentSubmission.status == "Pending Review"
    ).count()
    flagged = db.query(ContentSubmission).filter(
        ContentSubmission.company_id == company_id,
        ContentSubmission.status.in_(["Needs Changes", "Rejected"])
    ).count()

    recent_subs = db.query(ContentSubmission).filter(
        ContentSubmission.company_id == company_id
    ).order_by(desc(ContentSubmission.updated_at)).limit(6).all()

    # Recent activity logs across company
    recent_history = db.query(ReviewHistory).join(ContentSubmission).filter(
        ContentSubmission.company_id == company_id
    ).order_by(desc(ReviewHistory.created_at)).limit(10).all()

    activity_list = [
        {
            "id": h.id,
            "submission_id": h.submission_id,
            "submission_title": h.submission.title if h.submission else "Submission",
            "action": h.action,
            "performed_by": h.performed_by,
            "created_at": h.created_at.isoformat() if h.created_at else None
        }
        for h in recent_history
    ]

    return {
        "total_submissions": total,
        "approved_content": approved,
        "pending_reviews": pending,
        "flagged_content": flagged,
        "recent_activity": activity_list,
        "recent_submissions": recent_subs
    }


# ---------------- SPA STATIC SERVING (PRODUCTION & UNIFIED PORT) ----------------
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Don't hijack API routes or docs
        if full_path in ["docs", "redoc", "openapi.json"] or full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not found")
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        raise HTTPException(status_code=404, detail="Frontend build index.html not found")

