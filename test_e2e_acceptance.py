import sys
from backend.database import SessionLocal
from backend.main import (
    health_check, load_demo_data, list_guidelines, create_brand_rule,
    create_content_submission, analyze_content, update_content_submission,
    submit_for_review, approve_content, get_submission_history, get_dashboard_stats
)
from backend.schemas import (
    BrandRuleCreate, ContentSubmissionCreate, ContentSubmissionUpdate,
    ReviewDecisionCreate
)

def run_acceptance_tests():
    print("=" * 70)
    print("TRUSTORA — ROUND 2 ACCEPTANCE TEST SUITE")
    print("=" * 70)

    db = SessionLocal()

    try:
        # 1. Health check & zero-login verification
        print("\n[Step 1-2] Testing health and zero-login status...")
        health_data = health_check()
        print(f"  ✓ System healthy: {health_data['status']}")
        print(f"  ✓ Database: {health_data['database']}")
        print(f"  ✓ Mode: {health_data['mode']}")
        assert health_data["status"] == "healthy"

        # 3. Load NOVA TECH Demo Data
        print("\n[Step 3] Loading NOVA TECH demo data...")
        demo_res = load_demo_data(1, db)
        print(f"  ✓ {demo_res['message']} (Company: {demo_res['company_name']})")

        # 4-5. Inspect Admin Guidelines
        print("\n[Step 4-5] Inspecting Admin Brand Guidelines...")
        guidelines = list_guidelines(1, db)
        assert len(guidelines) >= 1, "Expected at least 1 guideline document"
        print(f"  ✓ Found guideline document: '{guidelines[0].document_name}'")
        assert len(guidelines[0].extracted_text) > 100, "Extracted text is empty"
        print(f"  ✓ Extracted text length: {len(guidelines[0].extracted_text)} chars")

        # 6. Add a custom Brand Rule as Admin
        print("\n[Step 6] Admin adds a new Brand Rule...")
        rule_payload = BrandRuleCreate(
            company_id=1,
            rule_type="Prohibited Term",
            rule_description="Do not refer to security as 'unhackable'.",
            rule_value="unhackable",
            severity="High"
        )
        created_rule = create_brand_rule(rule_payload, db)
        print(f"  ✓ Created rule #{created_rule.id}: {created_rule.rule_description}")

        # 7-8. Submit Content Containing Violations as Content Creator
        print("\n[Step 7-8] Content Creator submits copy with intentional violations...")
        violating_text = "Buyers can get 100% guaranteed results with our revolutionary product. This is the best technology available in the world."
        sub_payload = ContentSubmissionCreate(
            company_id=1,
            submitted_by=2,
            title="Acceptance Test Campaign",
            content_type="Advertisement",
            original_content=violating_text
        )
        submission = create_content_submission(sub_payload, db)
        sub_id = submission.id
        print(f"  ✓ Content submission created #{sub_id} with status: '{submission.status}'")

        # 9-11. Run AI RAG Analysis & Verify Categorized Findings
        print("\n[Step 9-11] Running AI / RAG analysis...")
        analysis = analyze_content(sub_id, db)
        findings = analysis["findings"]
        print(f"  ✓ Analysis completed via: {analysis['mode']}")
        print(f"  ✓ Issues detected: {len(findings)}")
        assert len(findings) >= 4, f"Expected at least 4 issues detected, got {len(findings)}"
        
        categories = set(f["issue_category"] for f in findings)
        print(f"  ✓ Identified categories: {categories}")
        for f in findings:
            print(f"     - [{f['issue_category']} | {f['severity']}] '{f['problematic_text']}' -> {f['suggested_correction']}")
            assert f["guideline_reference"], "Missing guideline reference citation"
            print(f"       Citation: {f['guideline_reference']}")

        # 12. Edit content using suggested corrections
        print("\n[Step 12] Content Creator applies suggested corrections...")
        corrected_text = "Customers can achieve measurable efficiency gains with our advanced enterprise platform, engineered with an industry-leading 99.95% SLA uptime."
        update_payload = ContentSubmissionUpdate(revised_content=corrected_text)
        update_content_submission(sub_id, update_payload, db)
        print("  ✓ Revised content saved.")

        # 13. Re-run analysis on revised content
        print("\n[Step 13] Re-running analysis on revised content...")
        reanalysis = analyze_content(sub_id, db)
        print(f"  ✓ Re-analysis issues: {len(reanalysis['findings'])}")
        assert len(reanalysis['findings']) == 0, f"Expected 0 issues after revision, got {len(reanalysis['findings'])}"

        # 14. Submit revised content for Review
        print("\n[Step 14] Sending revised content to Reviewer Queue...")
        sub_pending = submit_for_review(sub_id, db)
        assert sub_pending.status == "Pending Review"
        print(f"  ✓ Submission #{sub_id} status updated to '{sub_pending.status}'")

        # 15-16. Reviewer reviews & approves content
        print("\n[Step 15-16] Reviewer inspects and approves content...")
        decision_payload = ReviewDecisionCreate(
            decision="Approved",
            review_comment="Brand compliance verified against Nova Tech 2026 guidelines. Approved for publishing."
        )
        approved_sub = approve_content(sub_id, decision_payload, db)
        assert approved_sub.status == "Approved"
        print(f"  ✓ Submission status: '{approved_sub.status}'")

        # 17-18. Verify persistent History & Decision Trail
        print("\n[Step 17-18] Verifying Audit History & Decisions...")
        history = get_submission_history(sub_id, db)
        print(f"  ✓ Found {len(history)} persistent history logs for submission #{sub_id}:")
        for h in history:
            print(f"     - Action: '{h.action}' by '{h.performed_by}' at {h.created_at}")
        actions = [h.action for h in history]
        assert "Created" in actions
        assert "Analyzed" in actions
        assert "Submitted for Review" in actions
        assert "Approved" in actions

        # 19-20. Verify Dashboard metrics and persistent data survival
        print("\n[Step 19-20] Checking Dashboard live stats...")
        stats = get_dashboard_stats(1, db)
        print(f"  ✓ Total Submissions: {stats['total_submissions']}")
        print(f"  ✓ Approved Content: {stats['approved_content']}")
        print(f"  ✓ Pending Reviews: {stats['pending_reviews']}")
        print(f"  ✓ Flagged Content: {stats['flagged_content']}")
        assert stats["approved_content"] >= 1, "Approved content should be at least 1"

        print("\n" + "=" * 70)
        print("ALL ROUND 2 ACCEPTANCE TESTS PASSED SUCCESSFULLY! (20/20)")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    run_acceptance_tests()
