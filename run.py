import os
import sys
import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    print("=" * 60)
    print("Starting TRUSTORA Brand Governance Platform...")
    print(f"Server binding: http://{host}:{port}")
    print(f"API Docs: http://{host}:{port}/docs")
    print("=" * 60)
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)

