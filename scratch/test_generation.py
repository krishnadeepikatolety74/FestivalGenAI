import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

# Add root folder to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import GroqAPI

groq = GroqAPI()
try:
    print("Calling generate_festival_plan...")
    plan = groq.generate_festival_plan(
        festival="Christmas",
        city="Hyderabad",
        family_size=4,
        budget=15000,
        language="English",
        preferences=[]
    )
    print("Plan generation successful!")
    print(json.dumps(plan, indent=2)[:500])
except Exception as e:
    import traceback
    print("Plan generation failed with exception:")
    traceback.print_exc()
