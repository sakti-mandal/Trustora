# TRUSTORA — AI-Powered Brand Governance Platform
> **Trust, Before It Goes Live.**

**Team:** REDO  
**Hackathon:** CodeNexus India 2026 – Round 2  
**Tagline:** Trust, Before It Goes Live.  
**Mode:** Zero-Login Demo Mode (Hackathon Evaluation Ready)

---

## 1. Executive Summary

Marketing teams, copywriters, and agencies generate massive volumes of promotional content daily—advertisements, social media posts, product descriptions, whitepapers, and customer emails. Manually verifying every sentence against corporate brand guidelines, prohibited terminology, legal compliance rules, and approved factual benchmarks creates severe operational bottlenecks and exposes companies to regulatory penalties and brand erosion.

**TRUSTORA** is an enterprise-grade AI Brand Governance Platform that automates compliance auditing using **Retrieval-Augmented Generation (RAG)** combined with a deterministic rule engine and a human-in-the-loop review workflow.

Judges and evaluators can interact with the unified company workspace without requiring login or registration credentials.

---

## 2. Core End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ADMIN WORKSPACE                                          │
│    Upload Brand Guidelines (PDF / DOCX)                     │
│    Configure Brand Rules, Prohibited Words & Approved Facts │
└──────────────────────────────┬──────────────────────────────┘
                               │ (PyMuPDF / docx Extraction & RAG Chunking)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CONTENT CREATOR WORKSPACE                                │
│    Submit Marketing Draft (Ad, Blog, Social Post, Email)    │
│    Trigger AI Governance Audit                              │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Vector Retrieval & Gemini RAG / Rule Engine)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. AUDIT FINDINGS ACROSS 6 CATEGORIES                       │
│    - Brand Tone Mismatch                                    │
│    - Prohibited Terminology                                 │
│    - Missing Required Terminology                           │
│    - Unsupported or Unverified Claims                       │
│    - Inconsistent Brand Information                         │
│    - Grammar and Readability Suggestions                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (1-Click "Apply Suggestion" & Re-Analyze)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. HUMAN REVIEWER WORKSPACE                                 │
│    Side-by-Side Original vs Revised Comparison              │
│    Inspect AI Citations & Verification Status               │
│    Approve / Reject / Request Changes with Review Comments  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. IMMUTABLE AUDIT TRAIL & DECISION DATABASE                │
│    Persistent Relational Database Logging (SQLAlchemy)      │
└─────────────────────────────────────────────────────────────┘
```

> **Human-in-the-Loop Principle:** The final publishing decision always belongs to a human reviewer. AI never automatically approves or publishes live content.

---

## 3. Technology Stack

- **Frontend:** React.js, Tailwind CSS, Lucide React, Canvas Confetti, Vite.
- **Backend:** Python, FastAPI, Uvicorn, Pydantic v2.
- **Database & Migrations:** PostgreSQL (with SQLite zero-config local fallback), SQLAlchemy ORM 2.0, Alembic migrations.
- **AI & RAG Engine:** Gemini API (Gemini 2.5 Flash), Vector Retrieval with Lexical-Semantic Cosine Embeddings, Deterministic Regex Compliance Engine, and automated failsafe **Rule-Based Demo Mode**.
- **Document Extractors:** `pypdf`, `python-docx` (with native XML package fallback), PyMuPDF support.
- **Deployment:** Render / Railway / Docker / Vercel configurations included.

---

## 4. Database Schema (8 Connected Tables)

TRUSTORA uses a relational schema with foreign-key relationships and company-level tenant isolation:

1. **`companies`**: `id`, `company_name`, `industry`, `created_at`
2. **`users`**: `id`, `company_id`, `full_name`, `email`, `password_hash`, `role`, `created_at`
3. **`brand_guidelines`**: `id`, `company_id`, `document_name`, `file_path`, `extracted_text`, `upload_date`, `processing_status`
4. **`brand_rules`**: `id`, `company_id`, `rule_type`, `rule_description`, `rule_value`, `severity`, `created_at`
5. **`content_submissions`**: `id`, `company_id`, `submitted_by`, `title`, `content_type`, `original_content`, `revised_content`, `status`, `created_at`, `updated_at`
6. **`ai_findings`**: `id`, `submission_id`, `issue_category`, `severity`, `problematic_text`, `explanation`, `guideline_reference`, `suggested_correction`, `verification_status`, `created_at`
7. **`review_decisions`**: `id`, `submission_id`, `reviewer_id`, `decision`, `review_comment`, `created_at`
8. **`review_history`**: `id`, `submission_id`, `action`, `previous_content`, `updated_content`, `performed_by`, `created_at`

---

## 5. Quick Start & Local Development

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/trustora.git
cd trustora
```

### Step 2: Set Up Backend Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `GEMINI_API_KEY`. If omitted, TRUSTORA automatically runs in intelligent **Rule-Based Demo Mode** so judges can test all features immediately without requiring an API key).*

### Step 4: Run the Application

#### Option A: Unified Full-Stack Server (Recommended for Evaluation)
Build the frontend once, then serve both API and frontend on port 8000:
```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Start unified server
uvicorn backend.main:app --reload --port 8000
```
Open **`http://localhost:8000`** in any browser.

#### Option B: Concurrent Development Mode
In Terminal 1 (Backend):
```bash
uvicorn backend.main:app --reload --port 8000
```
In Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`**.

---

## 6. Round 2 Acceptance Test Instructions for Judges

Judges can complete the qualification test in under 2 minutes:

1. **Open the Workspace:** Navigate to `http://localhost:8000` (or the deployed URL). No login or registration is required.
2. **Review NOVA TECH Demo Profile:** Note the pre-loaded company profile, active brand manual, and 5 brand governance rules.
3. **Inspect Admin Workspace:**
   - Click **"Brand Guidelines"** in the sidebar.
   - Switch to **"Admin"** role via the role switcher in the top navigation.
   - View the pre-loaded **`Nova_Tech_Brand_Governance_Manual_2026.pdf`** and its extracted text.
   - Click **"Add Rule"** to create a custom brand rule (e.g. Prohibited Term or Preferred Term).
4. **Test Marketing Copy Audit:**
   - Switch role to **"Content Creator"**.
   - Click **"Test Violating Content Sample"** in the top yellow guide bar (or click **"Load Sample Violations"**).
   - This injects intentional violations:  
     `"Buyers can get 100% guaranteed results with our revolutionary product. This is the best technology available in the world."`
   - Click **"Analyse with AI"**.
   - Observe the 5 categorized findings detected across *Prohibited Terminology*, *Brand Tone Mismatch*, *Unsupported or Unverified Claims*, and *Inconsistent Brand Information*.
5. **Apply Suggested Fixes:**
   - Click the green **"Apply"** button next to each finding to automatically patch the draft editor with the approved replacement terms.
   - Click **"Analyse with AI"** again to see the violation count drop to zero.
6. **Submit to Human Review Queue:**
   - Click **"Send to Reviewer"**.
7. **Complete Human Review & Approval:**
   - Switch role to **"Reviewer"** (or automatically redirected).
   - Inspect the side-by-side comparison of **Original Draft** vs. **Revised Content**.
   - Enter a review comment (e.g. *"Brand compliance verified. Approved for Q2 launch."*).
   - Click **"Approve Content"** (triggers celebration feedback).
8. **Verify Persistent Audit History:**
   - Click **"History & Audits"** in the sidebar.
   - Verify every step (*Created &rarr; Analyzed &rarr; Revised &rarr; Submitted for Review &rarr; Approved*) is permanently logged with timestamps and user personas.
   - Refresh the browser—all data remains persistent in the database.

---

## 7. REST API Documentation

FastAPI provides interactive Swagger documentation at **`/docs`**:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & AI/database status |
| `GET` | `/dashboard/stats` | Live metric totals & recent audit events |
| `GET` | `/companies` | List workspace companies |
| `POST` | `/companies/{id}/load-demo` | Reload fictional demo company data |
| `GET` | `/guidelines` | List uploaded guideline documents |
| `POST` | `/guidelines/upload` | Upload & extract PDF/DOCX guidelines |
| `DELETE` | `/guidelines/{id}` | Delete a guideline document |
| `GET` | `/brand-rules` | List company brand rules |
| `POST` | `/brand-rules` | Create a new brand rule |
| `PUT` | `/brand-rules/{id}` | Update an existing brand rule |
| `DELETE` | `/brand-rules/{id}` | Delete a brand rule |
| `GET` | `/content` | List marketing submissions |
| `POST` | `/content/submit` | Create a new content draft |
| `PUT` | `/content/{id}` | Update draft content or title |
| `POST` | `/content/{id}/analyze` | Execute RAG & rule-based AI audit |
| `POST` | `/content/{id}/submit-review` | Send draft to human review queue |
| `POST` | `/content/{id}/approve` | Human reviewer approves content |
| `POST` | `/content/{id}/reject` | Human reviewer rejects content |
| `POST` | `/content/{id}/request-changes`| Human reviewer requests revisions |
| `GET` | `/content/{id}/history` | Retrieve complete audit trail |

---

## 8. Deployment Guide

### Deploying to Render
1. Connect this GitHub repository to Render.
2. Select **Web Service** or use the included **`render.yaml`** blueprint.
3. Build Command:
   ```bash
   pip install -r requirements.txt && cd frontend && npm install && npm run build
   ```
4. Start Command:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
5. Environment Variables:
   - `DATABASE_URL`: Add connection string of your hosted PostgreSQL database.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `APP_ENV`: `production`

### Deploying Frontend to Vercel
1. Import repository on Vercel.
2. Root Directory: `frontend` (or use top-level `vercel.json`).
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set `VITE_API_URL` to your deployed backend URL.

---

## 9. Hackathon Submission Summary

- **Product:** TRUSTORA
- **Tagline:** Trust, Before It Goes Live.
- **Team:** REDO
- **Round:** CodeNexus India 2026 – Round 2
- **Demo Ready:** Fully functional full-stack application with zero mandatory login gates, ready for instant evaluation.
