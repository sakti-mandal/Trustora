import os
import shutil
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.config import UPLOAD_DIR, GEMINI_API_KEY, DATABASE_URL
from backend.database import engine, get_db, Base
from backend.models import (
    Company, User, BrandGuideline, BrandRule, ContentSubmission,
    AIFinding, ReviewDecision, ReviewHistory
)
from backend.schemas import (
    CompanyCreate, CompanyOut, UserCreate, UserOut,
    BrandGuidelineOut, BrandRuleCreate, BrandRuleUpdate, BrandRuleOut,
    ContentSubmissionCreate, ContentSubmissionUpdate, ContentSubmissionOut,
    AIFindingOut, ReviewDecisionCreate, ReviewDecisionOut, ReviewHistoryOut,
    DashboardStats
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


@app.post("/companies/{company_id}/load-demo")
def load_demo_data(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    company = seed_nova_tech(db)
    return {
        "message": "NOVA TECH demo data loaded successfully",
        "company_id": company.id,
        "company_name": company.company_name
    }


# ---------------- USERS & AUTH ----------------
@app.get("/auth/users", response_model=List[UserOut])
def list_users(company_id: int = Query(1), db: Session = Depends(get_db)):
    return db.query(User).filter(User.company_id == company_id).all()


@app.post("/auth/register", response_model=UserOut)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        company_id=payload.company_id,
        full_name=payload.full_name,
        email=payload.email,
        role=payload.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


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

    decision = ReviewDecision(
        submission_id=sub.id,
        reviewer_id=payload.reviewer_id,
        decision="Approved",
        review_comment=payload.review_comment or "Content adheres to brand governance guidelines. Approved for publishing."
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

    decision = ReviewDecision(
        submission_id=sub.id,
        reviewer_id=payload.reviewer_id,
        decision="Rejected",
        review_comment=payload.review_comment or "Rejected due to brand non-compliance."
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

    decision = ReviewDecision(
        submission_id=sub.id,
        reviewer_id=payload.reviewer_id,
        decision="Changes Requested",
        review_comment=payload.review_comment or "Please revise flagged terminology and claims before publishing."
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
    db.commit()
    db.refresh(sub)
    return sub


@app.get("/content/{content_id}/history", response_model=List[ReviewHistoryOut])
def get_submission_history(content_id: int, db: Session = Depends(get_db)):
    return db.query(ReviewHistory).filter(ReviewHistory.submission_id == content_id).order_by(desc(ReviewHistory.id)).all()


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

