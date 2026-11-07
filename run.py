import os
import sys
from pathlib import Path

# Auto-detect local virtualenv site-packages if running with system python
root_dir = Path(__file__).resolve().parent
venv_site_packages_win = root_dir / "venv" / "Lib" / "site-packages"
venv_site_packages_nix = root_dir / "venv" / "lib"

if venv_site_packages_win.exists():
    if str(venv_site_packages_win) not in sys.path:
        sys.path.insert(0, str(venv_site_packages_win))
elif venv_site_packages_nix.exists():
    for p in venv_site_packages_nix.glob("python*/site-packages"):
        if str(p) not in sys.path:
            sys.path.insert(0, str(p))

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

