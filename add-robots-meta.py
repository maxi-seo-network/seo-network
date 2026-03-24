#!/usr/bin/env python3
import os
import re
from pathlib import Path

os.chdir('/home/node/.openclaw/workspace/seo-network')

count = 0
for html_file in Path('.').rglob('*.html'):
    content = html_file.read_text()
    
    # Skip if already has robots meta
    if 'meta name="robots"' in content or 'meta name=\'robots\'' in content:
        continue
    
    # Add robots meta after charset
    if '<meta charset="UTF-8">' in content:
        new_content = content.replace(
            '<meta charset="UTF-8">',
            '<meta charset="UTF-8">\n  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'
        )
        html_file.write_text(new_content)
        count += 1
        print(f"Fixed: {html_file}")
    elif '<meta charset="utf-8">' in content:
        new_content = content.replace(
            '<meta charset="utf-8">',
            '<meta charset="utf-8">\n  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'
        )
        html_file.write_text(new_content)
        count += 1
        print(f"Fixed: {html_file}")

print(f"\nAdded robots meta to {count} files")