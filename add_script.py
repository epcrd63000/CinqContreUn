#!/usr/bin/env python3
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = '    <script type="module" src="js/app.js"></script>'
new = old + '\n    <script src="js/challenges_ui.js" defer></script>'

if old in content:
    content = content.replace(old, new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Script added successfully')
else:
    print('Could not find script tag')
