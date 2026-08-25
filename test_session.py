import requests
import json
import time

print("=" * 50)
print("Testing FestivalGen AI - Fresh Session")
print("=" * 50)

# Create a session with cookie jar
session = requests.Session()

# Use a unique email for this test
test_email = f"test-{int(time.time())}@example.com"

# Test Signup with fresh user
print(f"\n[1] Testing Signup with {test_email}...")
signup_data = {
    "email": test_email,
    "password": "password123",
    "name": "Fresh Test User"
}
resp = session.post('http://localhost:5000/api/auth/signup', json=signup_data)
print(f"Status: {resp.status_code}")
if resp.status_code == 201:
    user_data = resp.json()
    print(f"Signup Success!")
    print(f"  - ID: {user_data['id']}")
    print(f"  - Name: {user_data['name']}")
    print(f"  - Email: {user_data['email']}")
    print(f"  - Role: {user_data['role']}")
else:
    print(f"Error: {resp.text}")

# Test Get current user
print(f"\n[2] Testing Get Current User after signup...")
resp = session.get('http://localhost:5000/api/auth/me')
print(f"Status: {resp.status_code}")
user_response = resp.json()
if user_response:
    print(f"Current User: {user_response.get('name')} ({user_response.get('email')})")
else:
    print(f"No user in session (response was null)")

# Test Frontend
print(f"\n[3] Testing Frontend...")
resp = session.get('http://localhost:5000/')
print(f"Status: {resp.status_code}")
is_react = 'React' in resp.text or 'root' in resp.text
print(f"React app served: {is_react}")

# Test Logout
print(f"\n[4] Testing Logout...")
resp = session.post('http://localhost:5000/api/auth/logout')
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")

# Test Get current user after logout
print(f"\n[5] Testing Get Current User after logout...")
resp = session.get('http://localhost:5000/api/auth/me')
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")

print("\n" + "=" * 50)
print("Session test completed!")
print("=" * 50)
