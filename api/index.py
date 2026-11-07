import os
import sys
from pathlib import Path

# Add project root directory to sys.path so backend imports work seamlessly
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.main import app
from backend.database import SessionLocal
from backend.models import Company
from backend.seed_data import seed_nova_tech

# Cold-start database check for Vercel Serverless environment
try:
    with SessionLocal() as db:
        if not db.query(Company).filter(Company.company_name == "NOVA TECH").first():
            seed_nova_tech(db)
except Exception as e:
    print(f"Vercel DB initialization note: {e}")
