with open('client/src/index.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(310, 360):
    if i < len(lines):
        print(f"{i+1}: {lines[i].strip()}")
