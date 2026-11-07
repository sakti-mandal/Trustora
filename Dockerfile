# ===================================================
# Stage 1: Build Frontend Assets (Vite + React)
# ===================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ===================================================
# Stage 2: Production Python Backend (FastAPI + SPA)
# ===================================================
FROM python:3.11-slim AS production

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    APP_ENV=production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Backend Code and Configuration
COPY backend/ ./backend/
COPY alembic/ ./alembic/
COPY alembic.ini ./
COPY run.py ./

# Copy Built Frontend Distribution from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose dynamic application port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start unified server
CMD ["python", "run.py"]

