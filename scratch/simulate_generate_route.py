import json
import requests

payload = {
    "festival": "Christmas",
    "city": "Hyderabad, Telangana",
    "familySize": 4,
    "budget": 15000,
    "language": "English",
    "preferences": ["Vegetarian", "Family-friendly", "Traditional rituals"]
}

try:
    response = requests.post("http://localhost:5000/api/plans/generate", json=payload)
    print("Response status:", response.status_code)
    try:
        print("Response JSON:", json.dumps(response.json(), indent=2))
    except:
        print("Response Text:", response.text)
except Exception as e:
    print("Error calling route:", e)
