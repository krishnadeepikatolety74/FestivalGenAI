import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API key present: {api_key is not None}")

url = f"https://generativelanguage.googleapis.com/v1beta/models"
try:
    response = requests.get(url, params={'key': api_key})
    print("Status:", response.status_code)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print("Available models:")
        for m in models:
            print(f"- {m['name']} (supported methods: {m.get('supportedGenerationMethods')})")
    else:
        print("Error response:", response.text)
except Exception as e:
    print("Error:", e)
