import requests

url = "https://forge.butterfly-effect.dev/v1/maps/proxy/maps/api/js"
params = {
    "key": "",
    "v": "weekly",
    "libraries": "marker,places,geocoding,geometry"
}

try:
    response = requests.get(url, params=params)
    print("Response status with empty key:", response.status_code)
    print("Response content preview:", response.text[:200])
except Exception as e:
    print("Failed to fetch with empty key:", e)

# Test with key="undefined"
params["key"] = "undefined"
try:
    response = requests.get(url, params=params)
    print("Response status with 'undefined' key:", response.status_code)
    print("Response content preview:", response.text[:200])
except Exception as e:
    print("Failed to fetch with 'undefined' key:", e)
