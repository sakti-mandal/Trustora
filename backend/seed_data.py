import logging
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.models import (
    Company, User, BrandGuideline, BrandRule, ContentSubmission,
    AIFinding, ReviewDecision, ReviewHistory
)
from backend.document_processor import chunk_text
from backend.rag_service import register_company_chunks, clear_company_knowledge

logger = logging.getLogger("trustora.seed")

def seed_nova_tech(db: Session) -> Company:
    """
    Seeds NOVA TECH company with comprehensive
    rules, facts, tone, and pre-staged content.
    """
    # Check if NOVA TECH exists
    company = db.query(Company).filter(Company.company_name == "NOVA TECH").first()
    if company:
        # Clear existing knowledge chunks to re-register
        clear_company_knowledge(company.id)
        if not company.description:
            company.description = "NOVA TECH provides secure, enterprise-grade cloud intelligence and governance platforms for modern organizations."
            db.commit()
    else:
        company = Company(
            company_name="NOVA TECH",
            industry="Enterprise Cloud & AI Solutions",
            description="NOVA TECH provides secure, enterprise-grade cloud intelligence and governance platforms for modern organizations."
        )
        db.add(company)
        db.commit()
        db.refresh(company)

    # 1. Demo Users
    demo_users = [
        {"full_name": "Sarah Chen", "email": "admin@novatech.io", "role": "Admin", "password": "trustora123"},
        {"full_name": "Marcus Rodriguez", "email": "creator@novatech.io", "role": "Content Creator", "password": "trustora123"},
        {"full_name": "Elena Rostova", "email": "reviewer@novatech.io", "role": "Reviewer", "password": "trustora123"}
    ]
    for u_data in demo_users:
        existing_u = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing_u:
            user = User(
                company_id=company.id,
                full_name=u_data["full_name"],
                email=u_data["email"],
                role=u_data["role"],
                password_hash=u_data.get("password", "trustora123")
            )
            db.add(user)
        else:
            if not existing_u.password_hash:
                existing_u.password_hash = u_data.get("password", "trustora123")
    db.commit()

    # 2. Sample Brand Guidelines Document
    sample_guideline_text = """
NOVA TECH BRAND GOVERNANCE MANUAL (2026 EDITION)
[CONFIDENTIAL - FICTIONAL DEMONSTRATION DOCUMENT]

SECTION 1: CORE BRAND PHILOSOPHY & TONE
At NOVA TECH, our brand tone is strictly professional, simple, clear, and trustworthy. We build enterprise solutions that mission-critical businesses rely upon. We deliberately avoid hype, sensationalism, and unproven superlatives. 
Our tone attributes:
- Professional: Objective, measured, and respectful of the audience's intelligence.
- Simple: Free of confusing industry buzzwords and hollow jargon.
- Trustworthy: Every technical capability stated must be verified by documented engineering benchmarks.

SECTION 2: APPROVED TERMINOLOGY STANDARDS
- Refer to purchasers and subscribers as "customers" or "enterprise partners". Never use the term "buyer" or "buyers" in public communications, advertisements, or blog posts.
- Use "Nova Intelligence Platform" for our primary platform name.
- Avoid vague sensationalist modifiers such as "revolutionary", "miraculous", "mind-blowing", or "magic".

SECTION 3: PROHIBITED PHRASES & ADVERTISING CLAIMS
- Prohibited Phrase: "100% guaranteed results" or any variation implying absolute perfection without risk. No cloud or software system can guarantee 100% outcomes without condition.
- Prohibited Superlative: "Best technology available in the world" or "unbeatable solution". Absolute superiority claims violate regulatory advertising standards and contradict our commitment to transparent facts.
- Avoid exaggerated promotional claims. All claims of cost reduction or speed improvements must specify "up to" and cite internal benchmarks.

SECTION 4: APPROVED COMPANY FACTS & BENCHMARKS
- Fact 1: NOVA TECH serves over 1,200 enterprise customers across financial services, healthcare, and logistics.
- Fact 2: Nova Intelligence Platform provides 99.95% measured uptime under enterprise SLA agreements.
- Fact 3: Customer onboarding duration averages 14 business days according to the 2025 Customer Success Audit.
- Fact 4: SOC-2 Type II and ISO 27001 certified data security protocols.
"""

    guideline = db.query(BrandGuideline).filter(
        BrandGuideline.company_id == company.id,
        BrandGuideline.document_name == "Nova_Tech_Brand_Governance_Manual_2026.pdf"
    ).first()

    if not guideline:
        guideline = BrandGuideline(
            company_id=company.id,
            document_name="Nova_Tech_Brand_Governance_Manual_2026.pdf",
            file_path="uploads/Nova_Tech_Brand_Governance_Manual_2026.pdf",
            extracted_text=sample_guideline_text,
            processing_status="processed"
        )
        db.add(guideline)
        db.commit()
        db.refresh(guideline)

    # Register chunks into RAG
    chunks = chunk_text(sample_guideline_text, guideline.document_name, chunk_size=100, overlap=25)
    register_company_chunks(company.id, chunks)

    # 3. Sample Brand Rules
    sample_rules = [
        {
            "rule_type": "Brand Tone",
            "rule_description": "Brand tone must be professional, simple, and trustworthy. Avoid exaggerated promotional hype.",
            "rule_value": "professional, simple, trustworthy",
            "severity": "High"
        },
        {
            "rule_type": "Prohibited Term",
            "rule_description": "Do not use the phrase '100% guaranteed results'. Absolute guarantees are legally prohibited.",
            "rule_value": "100% guaranteed results, guaranteed results",
            "severity": "High"
        },
        {
            "rule_type": "Preferred Term",
            "rule_description": "Use 'customer' instead of 'buyer' in all public-facing marketing copy.",
            "rule_value": "buyer -> customer",
            "severity": "Medium"
        },
        {
            "rule_type": "Approved Fact",
            "rule_description": "Product claims must be supported by approved company information. Nova platform provides 99.95% SLA uptime.",
            "rule_value": "99.95% measured SLA uptime, 1,200+ enterprise customers",
            "severity": "High"
        },
        {
            "rule_type": "Communication Standard",
            "rule_description": "Avoid absolute superlatives like 'best technology available in the world'. State demonstrated benefits instead.",
            "rule_value": "best technology available in the world, revolutionary",
            "severity": "High"
        }
    ]

    for r_data in sample_rules:
        existing_r = db.query(BrandRule).filter(
            BrandRule.company_id == company.id,
            BrandRule.rule_description == r_data["rule_description"]
        ).first()
        if not existing_r:
            rule = BrandRule(
                company_id=company.id,
                rule_type=r_data["rule_type"],
                rule_description=r_data["rule_description"],
                rule_value=r_data["rule_value"],
                severity=r_data["severity"]
            )
            db.add(rule)
    db.commit()

    # 4. Sample Marketing Content Submission (With intentional violations as specified in prompt)
    sample_title = "Q2 Cloud Launch Announcement - Global Campaign"
    sample_content = "Buyers can get 100% guaranteed results with our revolutionary product. This is the best technology available in the world."

    existing_sub = db.query(ContentSubmission).filter(
        ContentSubmission.company_id == company.id,
        ContentSubmission.title == sample_title
    ).first()

    if not existing_sub:
        submission = ContentSubmission(
            company_id=company.id,
            submitted_by=2,  # Marcus Rodriguez (Content Creator)
            title=sample_title,
            content_type="Advertisement",
            original_content=sample_content,
            revised_content=sample_content,  # Initial state contains the original text with intentional violations
            status="Draft"
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

        # Pre-seed findings for the sample submission
        sample_findings = [
            AIFinding(
                submission_id=submission.id,
                issue_category="Prohibited Terminology",
                severity="Medium",
                problematic_text="Buyers",
                explanation="Company guidelines require using 'customer' or 'customers' rather than 'buyer'.",
                guideline_reference="Nova Tech Brand Manual Section 2: Use 'customer' instead of 'buyer'.",
                suggested_correction="Customers",
                verification_status="Verified against Brand Rules"
            ),
            AIFinding(
                submission_id=submission.id,
                issue_category="Prohibited Terminology",
                severity="High",
                problematic_text="100% guaranteed results",
                explanation="Absolute outcome guarantees violate advertising standards and brand guidelines.",
                guideline_reference="Nova Tech Brand Manual Section 3: Prohibited phrase '100% guaranteed results'.",
                suggested_correction="measurable efficiency gains backed by verifiable benchmarks",
                verification_status="Verified against Brand Rules"
            ),
            AIFinding(
                submission_id=submission.id,
                issue_category="Brand Tone Mismatch",
                severity="High",
                problematic_text="revolutionary",
                explanation="Sensationalist hype word violates the professional, simple, and trustworthy brand tone standard.",
                guideline_reference="Nova Tech Tone Guidelines: Avoid exaggerated promotional claims like 'revolutionary'.",
                suggested_correction="advanced enterprise",
                verification_status="Verified against Guidelines"
            ),
            AIFinding(
                submission_id=submission.id,
                issue_category="Unsupported or Unverified Claims",
                severity="High",
                problematic_text="best technology available in the world",
                explanation="Unsubstantiated superlative claim. Claims must be supported by approved benchmarks or SLA data.",
                guideline_reference="Nova Tech Brand Manual Section 4: Approved Facts & Supported Claims.",
                suggested_correction="industry-leading enterprise platform with 99.95% SLA uptime",
                verification_status="Unverified – Human Review Required"
            )
        ]
        db.add_all(sample_findings)

        # Audit History
        history1 = ReviewHistory(
            submission_id=submission.id,
            action="Created",
            previous_content=None,
            updated_content=sample_content,
            performed_by="Marcus Rodriguez (Content Creator)"
        )
        history2 = ReviewHistory(
            submission_id=submission.id,
            action="Analyzed",
            previous_content=sample_content,
            updated_content=sample_content,
            performed_by="TRUSTORA AI Governance Engine"
        )
        db.add_all([history1, history2])
        db.commit()

    return company
