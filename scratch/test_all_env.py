import os
from dotenv import load_dotenv

load_dotenv()

print("All environment variables matching filters:")
for k, v in os.environ.items():
    kl = k.upper()
    if any(x in kl for x in ["FORGE", "GEMINI", "GOOGLE", "API", "MODEL", "KEY"]):
        print(f"- {k}: {v[:20]}... (length: {len(v)})")
