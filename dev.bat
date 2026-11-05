@echo off
title TRUSTORA Dev Environment
echo Starting Backend on http://127.0.0.1:8000 ...
start cmd /k ".\venv\Scripts\python.exe run.py"
echo Starting Vite Frontend on http://localhost:5173 ...
cd frontend
npm run dev

