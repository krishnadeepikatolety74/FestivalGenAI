import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
model = 'gemini-3.5-flash'
prompt = "Create a simple yellow light diya candle flame, vector style, white background"

print(f"Testing Gemini model: {model}")
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
    if 'candidates' in result:
        print("Candidates found!")
        for candidate in result.get('candidates', []):
            for part in candidate.get('content', {}).get('parts', []):
                print("Part keys:", list(part.keys()))
                if 'inlineData' in part:
                    print("  - inlineData mimeType:", part['inlineData'].get('mimeType'))
                    print("  - inlineData data length:", len(part['inlineData'].get('data', '')))
    else:
        print("Response body:", result)
except Exception as e:
    print("Error:", e)
