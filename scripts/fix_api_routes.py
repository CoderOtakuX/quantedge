import os
import re

api_dir = r"c:\Users\Admin\Documents\QUANTEDGE\app\api"
backend_env = "const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';"

# Patterns to match
# 1. const BASE = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
# 2. http://localhost:8000
# 3. ${BASE}

for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file == "route.ts":
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            original = content
            # Remove old BASE or BACKEND definitions
            content = re.sub(r'const (BASE|BACKEND) = process\.env\.[A-Z_]+ \|\| ["\']http://localhost:8000["\'];\n?', '', content)
            
            # Replace localhost strings with ${BACKEND}
            content = content.replace("http://localhost:8000", "${BACKEND}")
            
            # Replace ${BASE} with ${BACKEND}
            content = content.replace("${BASE}", "${BACKEND}")
            
            # Inject new BACKEND definition after imports
            lines = content.split("\n")
            inject_idx = 0
            for i, line in enumerate(lines):
                if line.startswith("import "):
                    inject_idx = i + 1
            
            if "${BACKEND}" in content and backend_env not in content:
                lines.insert(inject_idx, "")
                lines.insert(inject_idx + 1, backend_env)
                content = "\n".join(lines)
            
            if content != original:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated: {path}")
