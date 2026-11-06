from backend.main import (
    list_users, create_or_register_user, update_user_credentials,
    delete_user, login_user, update_company
)
from backend.schemas import UserCreate, UserAdminUpdate, LoginRequest, CompanyUpdate
from backend.database import SessionLocal
from fastapi import HTTPException

db = SessionLocal()

print('=== TESTING ADMIN DOMAIN & USER PROVISIONING ===')

# 1. Update company email domain
comp = update_company(1, CompanyUpdate(email_domain='trustora.corp'), db)
print(f'1. Company Domain Updated: {comp.email_domain}')
assert comp.email_domain == 'trustora.corp'

# 2. Admin creates a Content Creator
creator_req = UserCreate(
    company_id=1,
    full_name='Rachel Adams',
    email='rachel.adams@trustora.corp',
    role='Content Creator',
    password='RachelSecure#2026'
)
created_creator = create_or_register_user(creator_req, db)
print(f'2. Admin Created Creator: {created_creator.full_name} ({created_creator.email}), Role={created_creator.role}')
assert created_creator.role == 'Content Creator'
assert created_creator.email == 'rachel.adams@trustora.corp'

# 3. Admin creates a Reviewer (Approver)
reviewer_req = UserCreate(
    company_id=1,
    full_name='Marcus Vance',
    email='marcus.vance@trustora.corp',
    role='Reviewer',
    password='MarcusReview#2026'
)
created_reviewer = create_or_register_user(reviewer_req, db)
print(f'3. Admin Created Reviewer: {created_reviewer.full_name} ({created_reviewer.email}), Role={created_reviewer.role}')
assert created_reviewer.role == 'Reviewer'
assert created_reviewer.email == 'marcus.vance@trustora.corp'

# 4. Content Creator logs in with created domain credentials
login_creator = login_user(LoginRequest(
    email='rachel.adams@trustora.corp',
    password='RachelSecure#2026',
    role='Creator'
), db)
print(f'4. Creator Login: SUCCESS, token={login_creator["token"]}, user={login_creator["user"].email}')
assert login_creator['user'].role == 'Content Creator'

# 5. Reviewer / Approver logs in with created domain credentials
login_reviewer = login_user(LoginRequest(
    email='marcus.vance@trustora.corp',
    password='MarcusReview#2026',
    role='Approver'
), db)
print(f'5. Approver Login: SUCCESS, token={login_reviewer["token"]}, user={login_reviewer["user"].email}')
assert login_reviewer['user'].role == 'Reviewer'

# 6. Test wrong password rejection
try:
    login_user(LoginRequest(
        email='rachel.adams@trustora.corp',
        password='wrongpassword!',
        role='Creator'
    ), db)
    assert False, 'Expected HTTPException(401) for incorrect password'
except HTTPException as e:
    assert e.status_code == 401
    print(f'6. Wrong password properly rejected with 401: "{e.detail}"')

# 7. Admin updates credentials (resets password)
updated = update_user_credentials(created_reviewer.id, UserAdminUpdate(password='NewMarcusPass#999'), db)
print(f'7. Admin reset password for {updated.full_name}')

# Verify login with new password
login_rev2 = login_user(LoginRequest(
    email='marcus.vance@trustora.corp',
    password='NewMarcusPass#999',
    role='Approver'
), db)
print('   Reviewer Login with reset password: SUCCESS')

# 8. List all domain accounts
all_users = list_users(1, db)
print(f'8. Total Domain Users in Company: {len(all_users)}')
for u in all_users:
    print(f'   - [{u.role}] {u.full_name} ({u.email}) - HasPassword={u.has_password}')

# Clean up test users
del_res = delete_user(created_creator.id, db)
print(f'9. Admin deleted test account: {del_res["message"]}')
del_res2 = delete_user(created_reviewer.id, db)
print(f'   Admin deleted test account: {del_res2["message"]}')

# Reset company domain back to novatech.io
update_company(1, CompanyUpdate(email_domain='novatech.io'), db)
print('=== ALL 9 ADMIN DOMAIN & USER PROVISIONING TESTS PASSED 100%! ===')
