import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
model = 'imagen-3.0-generate-002'
prompt = "Create a simple yellow light diya candle flame, vector style, white background"

print(f"Testing Imagen model: {model}")
try:
    response = requests.post(
        f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
        params={'key': api_key},
        headers={'Content-Type': 'application/json'},
        json={
            'contents': [{'parts': [{'text': prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE']}
        },
        timeout=60
    )
    print("Status code:", response.status_code)
    result = response.json()
    print("Response keys:", list(result.keys()))
    if 'candidates' in result:
        print("Candidates found!")
    else:
        print("Response body:", result)
except Exception as e:
    print("Error:", e)
