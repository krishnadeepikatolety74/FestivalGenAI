import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
model = 'gemini-3.5-flash'

prompts = [
    "Generate an image of a traditional Indian festival celebration for Vinayaka Chavithi, featuring an elegant Lord Ganesha idol decorated with marigold flowers, traditional lamps, modaks, subtle rangoli, warm festive lighting, tasteful Indian home decoration, pastel pink, lavender, cream and soft golden color palette, clean premium composition, realistic photography style, no text, no watermark.",
    "Show an illustration of a lit diya lamp during Diwali, warm lights, flowers, traditional decorations.",
]

for i, prompt in enumerate(prompts):
    print(f"Testing Prompt {i+1}:")
    try:
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
            params={'key': api_key},
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {
                    'responseModalities': ['IMAGE']
                }
            },
            timeout=60
        )
        print("Status code:", response.status_code)
        result = response.json()
        if 'candidates' in result:
            candidate = result['candidates'][0]
            finish_reason = candidate.get('finishReason')
            print("Finish reason:", finish_reason)
            parts = candidate.get('content', {}).get('parts', [])
            print("Number of parts:", len(parts))
            for part in parts:
                if 'inlineData' in part:
                    print("  - mimeType:", part['inlineData'].get('mimeType'))
                    print("  - data length:", len(part['inlineData'].get('data', '')))
        else:
            print("Response:", result)
    except Exception as e:
        print("Error:", e)
    print("-" * 40)
