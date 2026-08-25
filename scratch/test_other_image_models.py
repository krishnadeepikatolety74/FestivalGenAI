import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
models = [
    'gemini-3-pro-image',
    'gemini-3.1-flash-lite-image',
    'gemini-3.5-flash-lite',
]

prompt = "Create a simple yellow light diya candle flame, vector style, white background"

for model in models:
    print(f"Testing model: {model}")
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
            candidate = result['candidates'][0]
            print("  - Finish reason:", candidate.get('finishReason'))
            parts = candidate.get('content', {}).get('parts', [])
            print("  - Number of parts:", len(parts))
            for part in parts:
                if 'inlineData' in part:
                    print("    - mimeType:", part['inlineData'].get('mimeType'))
                    print("    - data length:", len(part['inlineData'].get('data', '')))
        else:
            print("  - Response:", result)
    except Exception as e:
        print("  - Error:", e)
    print("-" * 40)
