import sys
from backend.database import SessionLocal
from backend.main import (
    health_check, load_demo_data, update_company, list_brand_rules, create_brand_rule,
    create_content_submission, analyze_content, update_content_submission,
    submit_for_review, request_changes, approve_content, get_submission_history,
    get_dashboard_stats, list_notifications
)
from backend.schemas import (
    CompanyUpdate, BrandRuleCreate, ContentSubmissionCreate,
    ContentSubmissionUpdate, ReviewDecisionCreate
)

def run_acceptance_tests():
    print("=" * 70)
    print("TRUSTORA — COMPLETE ROLE-BASED WORKFLOW TEST SUITE")
    print("=" * 70)

    db = SessionLocal()

    try:
        # Step 1: Health check
        print("\n[Step 1] Verifying System Health...")
        health = health_check()
        print(f"  ✓ System healthy: {health['status']}")
        print(f"  ✓ Mode: {health['mode']}")
        assert health["status"] == "healthy"

        # Step 2: Seed & Load Company
        print("\n[Step 2] Loading Company Workspace...")
        load_demo_data(1, db)

        # Step 3: Admin configures company information
        print("\n[Step 3] ADMIN: Configuring Company Information...")
        comp_payload = CompanyUpdate(
            company_name="NOVA TECH",
            industry="Enterprise Cloud & AI Solutions",
            description="NOVA TECH develops secure, scalable cloud intelligence platforms with strict brand governance."
        )
        updated_comp = update_company(1, comp_payload, db)
        print(f"  ✓ Updated company: {updated_comp.company_name} ({updated_comp.industry})")
        assert updated_comp.company_name == "NOVA TECH"

        # Step 4: Admin manages brand tone, approved facts, prohibited & preferred terms
        print("\n[Step 4] ADMIN: Adding and Managing Brand Governance Rules...")
        admin_rules = [
            BrandRuleCreate(
                company_id=1,
                rule_type="Brand Tone",
                rule_description="Brand tone must be professional, simple, and trustworthy. Avoid sensationalist hype.",
                rule_value="professional, simple, trustworthy",
                severity="High"
            ),
            BrandRuleCreate(
                company_id=1,
                rule_type="Prohibited Term",
                rule_description="Do not use the phrase '100% guaranteed results'. Absolute guarantees are legally prohibited.",
                rule_value="100% guaranteed results",
                severity="High"
            ),
            BrandRuleCreate(
                company_id=1,
                rule_type="Preferred Term",
                rule_description="Use 'customer' instead of 'buyer' in all public-facing copy.",
                rule_value="buyer -> customer",
                severity="Medium"
            ),
            BrandRuleCreate(
                company_id=1,
                rule_type="Approved Fact",
                rule_description="Platform provides 99.95% measured SLA uptime for over 1,200 enterprise customers.",
                rule_value="99.95% SLA uptime, 1,200+ customers",
                severity="High"
            )
        ]
        for r_payload in admin_rules:
            r = create_brand_rule(r_payload, db)
            print(f"  ✓ Admin rule saved: [{r.rule_type}] {r.rule_description[:60]}...")

        # Step 5: Content Creator creates new marketing copy with intentional violations
        print("\n[Step 5] CONTENT CREATOR: Creating Marketing Copy...")
        raw_copy = "Buyers can get 100% guaranteed results with our revolutionary product. This is the best technology available in the world."
        sub_payload = ContentSubmissionCreate(
            company_id=1,
            submitted_by=2,
            title="Q3 Enterprise Launch Campaign",
            content_type="Advertisement",
            original_content=raw_copy
        )
        submission = create_content_submission(sub_payload, db)
        sub_id = submission.id
        print(f"  ✓ Submission #{sub_id} created with status: '{submission.status}'")

        # Step 6: AI analyses copy against Admin's saved rules
        print("\n[Step 6] AI SYSTEM: Analyzing Content against Admin's Saved Rules...")
        analysis = analyze_content(sub_id, db)
        findings = analysis["findings"]
        print(f"  ✓ Analysis engine: {analysis['mode']}")
        print(f"  ✓ Detected violations: {len(findings)}")
        assert len(findings) >= 4, f"Expected violations to be detected, got {len(findings)}"
        for f in findings:
            print(f"     - [{f['issue_category']} | {f['severity']}] '{f['problematic_text']}' -> Suggested: '{f['suggested_correction']}'")
            print(f"       Citation: {f['guideline_reference']}")

        # Step 7: Content Creator submits to Reviewer
        print("\n[Step 7] CONTENT CREATOR: Submitting Copy to Reviewer...")
        sub_pending = submit_for_review(sub_id, db)
        assert sub_pending.status == "Pending Review"
        print(f"  ✓ Submission status: '{sub_pending.status}'")

        # Verify Reviewer received notification
        notifs_rev = list_notifications(1, "Reviewer", db)
        print(f"  ✓ Reviewer notifications count: {len(notifs_rev)}")
        assert any(n.notification_type == "review_request" for n in notifs_rev)
        print(f"     Notification: {notifs_rev[0].title} - {notifs_rev[0].message[:60]}...")

        # Step 8: Reviewer inspects and REQUESTS CHANGES with feedback comment
        print("\n[Step 8] REVIEWER: Inspecting and Requesting Changes...")
        reviewer_comment = "Please replace prohibited term '100% guaranteed results' and use 'customer' instead of 'buyer'."
        sub_needs_changes = request_changes(sub_id, ReviewDecisionCreate(
            decision="Changes Requested",
            review_comment=reviewer_comment
        ), db)
        assert sub_needs_changes.status == "Needs Changes"
        print(f"  ✓ Submission status: '{sub_needs_changes.status}'")

        # Verify Content Creator received notification with reviewer feedback
        notifs_creator = list_notifications(1, "Content Creator", db)
        assert any(n.notification_type == "changes_requested" for n in notifs_creator)
        print(f"  ✓ Creator received change request notification:")
        print(f"     '{notifs_creator[0].message}'")

        # Step 9: Content Creator edits copy using suggestions and re-analyses
        print("\n[Step 9] CONTENT CREATOR: Revising Copy based on Reviewer Feedback...")
        revised_copy = "Customers can achieve measurable efficiency gains with our advanced enterprise platform, engineered with an industry-leading 99.95% SLA uptime."
        update_content_submission(sub_id, ContentSubmissionUpdate(revised_content=revised_copy), db)
        reanalysis = analyze_content(sub_id, db)
        print(f"  ✓ Re-analysis detected issues: {len(reanalysis['findings'])}")
        assert len(reanalysis['findings']) == 0, "Expected 0 issues after applying corrections"

        # Step 10: Content Creator resubmits revised copy for another review
        print("\n[Step 10] CONTENT CREATOR: Resubmitting Revised Copy to Reviewer...")
        sub_resubmitted = submit_for_review(sub_id, db)
        assert sub_resubmitted.status == "Pending Review"
        print(f"  ✓ Resubmission status: '{sub_resubmitted.status}'")

        # Step 11: Reviewer inspects revised copy and APPROVES
        print("\n[Step 11] REVIEWER: Reviewing and Approving Final Content...")
        approval_comment = "Brand compliance fully verified against all rules. Approved for live publishing."
        sub_approved = approve_content(sub_id, ReviewDecisionCreate(
            decision="Approved",
            review_comment=approval_comment
        ), db)
        assert sub_approved.status == "Approved"
        print(f"  ✓ Final submission status: '{sub_approved.status}'")

        # Step 12: Verify complete audit history in database
        print("\n[Step 12] Verifying Complete Audit History Trail in Database...")
        history = get_submission_history(sub_id, db)
        print(f"  ✓ Total audit events recorded: {len(history)}")
        actions = [h.action for h in history]
        print(f"     Actions in order: {actions}")
        assert "Created" in actions
        assert "Submitted for Review" in actions
        assert "Changes Requested" in actions
        assert "Revised" in actions
        assert "Approved" in actions

        # Step 13: Dashboard live stats verification
        print("\n[Step 13] Verifying Dashboard Live Metrics...")
        stats = get_dashboard_stats(1, db)
        print(f"  ✓ Total Submissions: {stats['total_submissions']}")
        print(f"  ✓ Approved Content: {stats['approved_content']}")
        print(f"  ✓ Pending Reviews: {stats['pending_reviews']}")
        print(f"  ✓ Flagged Content: {stats['flagged_content']}")

        print("\n" + "=" * 70)
        print("COMPLETE CONNECTED WORKFLOW TEST PASSED! (ALL 13 STEPS)")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    run_acceptance_tests()
