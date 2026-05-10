import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Replace overly bright hex codes
    new_content = re.sub(r'bg-\[\#23262f\]', 'bg-ab-surface-2', new_content)
    new_content = re.sub(r'bg-\[\#2f333e\]', 'bg-ab-border-bright', new_content)
    new_content = re.sub(r'bg-\[\#2a2d36\]', 'bg-ab-border', new_content)
    new_content = re.sub(r'border-\[\#3e414b\]', 'border-ab-border-bright', new_content)
    
    # Replace utility tailwind panels with .forge-panel
    new_content = re.sub(r'bg-ab-surface\s+border\s+border-ab-border\s+rounded-xl\s+p-\d+', 'forge-panel', new_content)
    new_content = re.sub(r'bg-ab-surface\s+border\s+border-ab-border\s+rounded-lg\s+p-\d+', 'forge-panel', new_content)
    
    # Replace text-white with text-ab-text
    new_content = re.sub(r'\btext-white\b', 'text-ab-text', new_content)
    
    # Fix standard colors
    new_content = re.sub(r'\btext-green-400\b', 'text-ab-green', new_content)
    new_content = re.sub(r'\btext-green-500\b', 'text-ab-green', new_content)
    new_content = re.sub(r'\bbg-green-400\b', 'bg-ab-green', new_content)
    new_content = re.sub(r'\bbg-green-500\b', 'bg-ab-green', new_content)
    new_content = re.sub(r'\bbg-green-500/10\b', 'bg-ab-green/10', new_content)
    new_content = re.sub(r'\bborder-green-500/20\b', 'border-ab-green/20', new_content)

    new_content = re.sub(r'\btext-yellow-500\b', 'text-ab-gold', new_content)
    new_content = re.sub(r'\bbg-yellow-500/10\b', 'bg-ab-gold/10', new_content)
    new_content = re.sub(r'\bborder-yellow-500/20\b', 'border-ab-gold/20', new_content)

    new_content = re.sub(r'\btext-red-500\b', 'text-ab-red', new_content)
    new_content = re.sub(r'\bbg-red-500/10\b', 'bg-ab-red/10', new_content)
    new_content = re.sub(r'\bborder-red-500/20\b', 'border-ab-red/20', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    src_dir = 'src'
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
