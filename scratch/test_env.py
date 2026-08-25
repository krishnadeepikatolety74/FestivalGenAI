import os
from dotenv import load_dotenv

load_dotenv()

keys = [
    'GEMINI_API_KEY',
    'GEMINI_IMAGE_MODEL',
    'BUILT_IN_FORGE_API_URL',
    'BUILT_IN_FORGE_API_KEY',
    'GROQ_API_KEY',
    'DATABASE_URL',
]

print("Environment variables:")
for k in keys:
    val = os.getenv(k)
    if val:
        print(f"- {k}: {val[:12]}... (length: {len(val)})")
    else:
        print(f"- {k}: Not set")
