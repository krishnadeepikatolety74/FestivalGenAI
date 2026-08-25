with open('client/src/index.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("CSS lines matching search:")
for idx, line in enumerate(lines):
    if any(x in line.lower() for x in ["upcoming", "banner", "art-card", "dashboard-art"]):
        print(f"{idx+1}: {line.strip()}")
