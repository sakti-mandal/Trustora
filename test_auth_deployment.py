from backend.main import login_user, create_or_register_user, update_user_credentials
from backend.schemas import LoginRequest, UserCreate, UserAdminUpdate
from backend.database import SessionLocal
from backend.seed_data import seed_nova_tech
from fastapi import HTTPException

db = SessionLocal()

print('=== TESTING DEPLOYMENT AUTHENTICATION RESILIENCE ===')

# Ensure demo data is seeded
seed_nova_tech(db)

# 1. Test Demo Admin Login
res_admin = login_user(LoginRequest(email='admin@novatech.io', password='trustora123', role='Admin'), db)
print(f'1. Admin Login: status=SUCCESS, role={res_admin["user"].role}, email={res_admin["user"].email}')
assert res_admin["user"].role == 'Admin'

# 2. Test Demo Creator Login
res_creator = login_user(LoginRequest(email='creator@novatech.io', password='trustora123', role='Content Creator'), db)
print(f'2. Creator Login: status=SUCCESS, role={res_creator["user"].role}, email={res_creator["user"].email}')
assert res_creator["user"].role == 'Content Creator'

# 3. Test Demo Reviewer / Approver Login
res_reviewer = login_user(LoginRequest(email='reviewer@novatech.io', password='trustora123', role='Reviewer'), db)
print(f'3. Approver Login: status=SUCCESS, role={res_reviewer["user"].role}, email={res_reviewer["user"].email}')
assert res_reviewer["user"].role == 'Reviewer'

# 4. Test Judge / Evaluator custom email auto-provisioning
res_judge = login_user(LoginRequest(email='judge.evaluation@hackathon.org', password='AnySecurePassword2026!', role='Approver'), db)
print(f'4. Custom Judge Auto-provision: status=SUCCESS, role={res_judge["user"].role}, email={res_judge["user"].email}')
assert res_judge["user"].role == 'Reviewer'

# 5. Test Admin created custom user credentials
import time
unique_email = f'member.{int(time.time())}@novatech.io'
created_user = create_or_register_user(UserCreate(
    company_id=1,
    full_name='Test Provisioned Member',
    email=unique_email,
    role='Content Creator',
    password='CustomMember#Pass2026'
), db)
print(f'5. Admin created user: {created_user.full_name} ({created_user.email})')

# Login with correct custom password
res_member = login_user(LoginRequest(email=unique_email, password='CustomMember#Pass2026', role='Content Creator'), db)
print(f'6. Member Login with correct password: SUCCESS')

# Login with wrong custom password
try:
    login_user(LoginRequest(email=unique_email, password='WrongPassword123!', role='Content Creator'), db)
    assert False, 'Expected 401 for wrong custom password'
except HTTPException as e:
    assert e.status_code == 401
    print(f'7. Wrong custom password rejected as expected: {e.detail}')

print('=== ALL 7 AUTHENTICATION TESTS PASSED WITH 100% SUCCESS ===')
