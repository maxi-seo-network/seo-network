#!/usr/bin/env python3
import os
import re
from pathlib import Path

os.chdir('/home/node/.openclaw/workspace/seo-network')

count = 0
for html_file in Path('.').rglob('*.html'):
    content = html_file.read_text()
    
    # Skip if already has hreflang
    if 'hreflang=' in content:
        continue
    
    # Find canonical URL
    match = re.search(r'rel="canonical" href="([^"]+)"', content)
    if not match:
        continue
    
    canonical = match.group(1)
    
    # Create hreflang tags
    hreflang_tags = f'''  <link rel="alternate" hreflang="en" href="{canonical}">
  <link rel="alternate" hreflang="x-default" href="{canonical}">'''
    
    # Insert after canonical line
    new_content = content.replace(
        f'rel="canonical" href="{canonical}">',
        f'rel="canonical" href="{canonical}">\n{hreflang_tags}'
    )
    
    html_file.write_text(new_content)
    count += 1

print(f"Added hreflang to {count} files")