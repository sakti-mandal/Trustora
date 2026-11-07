import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

# Detect if running in Vercel or AWS Lambda read-only environment
IS_VERCEL = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
STORAGE_DIR = Path("/tmp") if IS_VERCEL else BASE_DIR

# Storage directories
UPLOAD_DIR = STORAGE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

CHROMA_DIR = STORAGE_DIR / "chroma_db"
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

# Database URL - PostgreSQL with SQLite fallback (use /tmp on Vercel)
DEFAULT_DB = "sqlite:////tmp/trustora.db" if IS_VERCEL else f"sqlite:///{BASE_DIR}/trustora.db"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB)
# Fix Heroku/Render postgres:// vs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
APP_ENV = os.getenv("APP_ENV", "development")
SECRET_KEY = os.getenv("SECRET_KEY", "trustora-secret-key-hackathon-2026")

