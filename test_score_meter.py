import json
from backend.database import SessionLocal
from backend.main import (
    get_compliance_score, create_content_submission, analyze_content
)
from backend.schemas import ContentSubmissionCreate

def test_score_meter():
    print("Testing Compliance Score Meter Endpoints directly...")
    db = SessionLocal()

    try:
        # 1. Admin score (average across company)
        admin_data = get_compliance_score(company_id=1, role="Admin", db=db)
        print("Admin Score Response:")
        print(json.dumps(admin_data, indent=2))
        assert admin_data["has_score"] is True
        assert 0 <= admin_data["overall_score"] <= 100
        assert "category_scores" in admin_data
        assert "brand_tone" in admin_data["category_scores"]

        # 2. Content Creator with submission #1 (analysed)
        sub1_data = get_compliance_score(company_id=1, role="Content Creator", submission_id=1, db=db)
        print("\nCreator (Submission 1) Score Response:")
        print(json.dumps(sub1_data, indent=2))
        assert sub1_data["has_score"] is True
        assert 0 <= sub1_data["overall_score"] <= 100

        # 3. Content Creator with new draft (unanalysed)
        draft_payload = ContentSubmissionCreate(
            company_id=1,
            title="Unanalysed Draft Test",
            content_type="Blog",
            original_content="This is raw unanalysed content.",
            submitted_by=2
        )
        created_draft = create_content_submission(draft_payload, db=db)
        draft_id = created_draft.id

        draft_score = get_compliance_score(company_id=1, role="Content Creator", submission_id=draft_id, db=db)
        print(f"\nCreator (Draft #{draft_id}) Score Response:")
        print(json.dumps(draft_score, indent=2))
        assert draft_score["has_score"] is False
        assert draft_score["overall_score"] is None
        assert draft_score["status_label"] == "Not Analysed"

        # Now analyse the draft
        analyze_content(draft_id, db=db)
        analysed_draft_score = get_compliance_score(company_id=1, role="Content Creator", submission_id=draft_id, db=db)
        print(f"\nCreator (Analysed Draft #{draft_id}) Score Response:")
        print(json.dumps(analysed_draft_score, indent=2))
        assert analysed_draft_score["has_score"] is True
        assert analysed_draft_score["overall_score"] is not None

        # 4. Reviewer score
        reviewer_data = get_compliance_score(company_id=1, role="Reviewer", db=db)
        print("\nReviewer Score Response:")
        print(json.dumps(reviewer_data, indent=2))
        assert reviewer_data["has_score"] is True

        print("\n>>> All Compliance Score Meter tests passed with 100% success! <<<")
    finally:
        db.close()

if __name__ == "__main__":
    test_score_meter()
