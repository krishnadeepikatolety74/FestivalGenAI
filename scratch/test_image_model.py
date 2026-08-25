import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
models_to_test = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image']

prompt = "Create a simple yellow light diya candle flame, vector style, white background"

for model in models_to_test:
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
                    if 'inlineData' in part:
                        print("  - inlineData mimeType:", part['inlineData'].get('mimeType'))
                        print("  - inlineData data length:", len(part['inlineData'].get('data', '')))
                        # Stop after finding image
                        break
        else:
            print("Response body:", result)
    except Exception as e:
        print("Error:", e)
    print("-" * 40)
