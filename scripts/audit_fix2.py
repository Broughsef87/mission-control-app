import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # Catch any remaining hex colors
    new_content = re.sub(r'bg-\[\#[a-fA-F0-9]{6}\]', 'bg-ab-surface-2', new_content)
    new_content = re.sub(r'border-\[\#[a-fA-F0-9]{6}\]', 'border-ab-border', new_content)

    # Soften text-ab-text to text-ab-body to fix "bold and white" issue
    new_content = new_content.replace('text-ab-text', 'text-ab-body')
    new_content = new_content.replace('font-bold text-ab-body', 'font-bold text-ab-text')
    new_content = new_content.replace('font-semibold text-ab-body', 'font-semibold text-ab-text')
    new_content = new_content.replace('text-xl text-ab-body', 'text-xl text-ab-text')
    new_content = new_content.replace('text-2xl text-ab-body', 'text-2xl text-ab-text')
    
    # Standardize remaining tailwind utility colors to ab tokens
    color_map = {
        r'\btext-yellow-\d00\b': 'text-ab-gold',
        r'\btext-amber-\d00\b': 'text-ab-gold',
        r'\btext-indigo-\d00\b': 'text-ab-blue',
        r'\btext-blue-\d00\b': 'text-ab-blue',
        r'\btext-red-\d00\b': 'text-ab-red',
        r'\btext-green-\d00\b': 'text-ab-green',
        
        r'\bbg-yellow-\d00': 'bg-ab-gold',
        r'\bbg-amber-\d00': 'bg-ab-gold',
        r'\bbg-indigo-\d00': 'bg-ab-blue',
        r'\bbg-blue-\d00': 'bg-ab-blue',
        r'\bbg-red-\d00': 'bg-ab-red',
        r'\bbg-green-\d00': 'bg-ab-green',
        
        r'\bborder-yellow-\d00': 'border-ab-gold',
        r'\bborder-amber-\d00': 'border-ab-gold',
        r'\bborder-indigo-\d00': 'border-ab-blue',
        r'\bborder-blue-\d00': 'border-ab-blue',
        r'\bborder-red-\d00': 'border-ab-red',
        r'\bborder-green-\d00': 'border-ab-green',
    }
    
    for pattern, replacement in color_map.items():
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
