import os
import sys
import webbrowser
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("Starting TRUSTORA Brand Governance Platform...")
    print("URL: http://127.0.0.1:8000")
    print("API Docs: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

