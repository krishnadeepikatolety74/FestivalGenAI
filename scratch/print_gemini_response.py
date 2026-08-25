import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
model = 'gemini-3.5-flash'
prompt = "Create a simple yellow light diya candle flame, vector style, white background"

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
    result = response.json()
    # Print the keys and structure
    print(json.dumps(result, indent=2)[:2000])
except Exception as e:
    print("Error:", e)
