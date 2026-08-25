with open('app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if '@app.' in line or 'latest' in line or 'generate' in line:
        print(f"{idx+1}: {line.strip()}")
