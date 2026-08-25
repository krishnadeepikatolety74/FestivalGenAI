with open('client/src/index.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Analytics rules:")
for idx, line in enumerate(lines):
    if ".analytics-card" in line or ".analytics-donut" in line or ".analytics-bar" in line:
        print(f"{idx+1}: {line.strip()}")
