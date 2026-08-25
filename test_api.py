import requests
import json

print("=" * 50)
print("Testing FestivalGen AI Flask API")
print("=" * 50)

# Create a session to maintain cookies/state
session = requests.Session()

# Test 1: Health check
print("\n[1] Testing Health Check...")
resp = session.get('http://localhost:5000/api/system/health')
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")

# Test 2: Signup
print("\n[2] Testing Signup...")
signup_data = {
    "email": "testuser@example.com",
    "password": "password123",
    "name": "Test User"
}
resp = session.post('http://localhost:5000/api/auth/signup', json=signup_data)
print(f"Status: {resp.status_code}")
if resp.status_code == 201:
    print(f"Response: {json.dumps(resp.json(), indent=2)}")
else:
    print(f"Error: {resp.text}")

# Test 3: Get current user (with session)
print("\n[3] Testing Get Current User (after signup)...")
resp = session.get('http://localhost:5000/api/auth/me')
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")

# Test 4: Logout
print("\n[4] Testing Logout...")
resp = session.post('http://localhost:5000/api/auth/logout')
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")

# Test 5: Get current user (after logout - should be null)
print("\n[5] Testing Get Current User (after logout)...")
resp = session.get('http://localhost:5000/api/auth/me')
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")

# Test 6: Frontend serving
print("\n[6] Testing Frontend...")
resp = session.get('http://localhost:5000/')
print(f"Status: {resp.status_code}")
print(f"Frontend contains React app: {'React' in resp.text or 'root' in resp.text or 'src' in resp.text}")

# Test 7: Plan generation without Groq key
print("\n[7] Testing Plan Generation (without Groq API key)...")
plan_data = {
    "festival": "Diwali",
    "city": "Mumbai",
    "familySize": 4,
    "budget": 50000,
    "language": "English",
    "preferences": ["traditional", "budget-friendly"]
}
resp = session.post('http://localhost:5000/api/plans/generate', json=plan_data)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")

print("\n" + "=" * 50)
print("All basic tests completed!")
print("=" * 50)
