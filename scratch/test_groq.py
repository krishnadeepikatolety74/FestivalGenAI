import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GROQ_API_KEY')
print("API Key:", api_key[:10] + "..." if api_key else "None")

# Try to list models
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.groq.com/openai/v1/models', headers=headers)
print("Models response status:", response.status_code)
if response.status_code == 200:
    models = response.json().get('data', [])
    print("Available models:")
    for m in models[:10]:
        print(" -", m.get('id'))
else:
    print(response.text)
