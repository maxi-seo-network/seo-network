#!/usr/bin/env python3
"""
Add financial disclaimer to all crypto HTML files missing it.
Run from seo-network directory.
"""

import os
import re
from pathlib import Path

# Templates
ENGLISH_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Disclaimer:</strong> This article is for educational purposes only and does not constitute financial advice. Cryptocurrency investments carry significant risk, including potential loss of principal. Always do your own research and consult a qualified financial advisor before making investment decisions.
    </div>
'''

PORTUGUESE_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Aviso:</strong> Este artigo é apenas para fins educativos e não constitui aconselhamento financeiro. Investimentos em criptomoedas acarretam risco significativo, incluindo perda potencial do capital investido. Faça sempre a sua própria investigação e consulte um consultor financeiro qualificado antes de tomar decisões de investimento.
    </div>
'''

def has_disclaimer(content):
    """Check if file has financial disclaimer."""
    patterns = [
        r'Financial Disclaimer',
        r'educational purposes only',
        r'fins educativos',
        r'does not constitute financial advice',
        r'não constitui aconselhamento financeiro'
    ]
    for pattern in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True
    return False

def is_portuguese(filepath, content):
    """Detect Portuguese files."""
    filepath_str = str(filepath).lower()
    if '/pt/' in filepath_str:
        return True
    if 'portugal' in filepath_str and 'melhor' in content.lower()[:2000]:
        return True
    
    # Check lang attribute
    if re.search(r'lang=["\']pt', content, re.IGNORECASE):
        return True
    
    # Check for Portuguese-specific words in title
    pt_words = ['como', 'para', 'melhor', 'comprar', 'carteira', 'taxas', 'segurança', 'português', 'criptomoedas']
    en_words = ['how', 'best', 'buy', 'wallet', 'fees', 'security', 'guide', 'review', 'complete']
    
    pt_count = sum(1 for w in pt_words if w in content.lower()[:3000])
    en_count = sum(1 for w in en_words if w in content.lower()[:3000])
    
    return pt_count > en_count

def fix_file(filepath):
    """Add financial disclaimer to a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if has_disclaimer(content):
            return 'skip'
        
        is_pt = is_portuguese(filepath, content)
        disclaimer = PORTUGUESE_DISCLAIMER if is_pt else ENGLISH_DISCLAIMER
        
        # Find body tag
        body_match = re.search(r'<body[^>]*>', content, re.IGNORECASE)
        if not body_match:
            return 'error'
        
        insert_pos = body_match.end()
        
        # Check if there's an affiliate disclosure to insert after
        affiliate_match = re.search(r'<div[^>]*>([\s\S]*?)(?:Affiliate Disclosure|Aviso de Afiliado)([\s\S]*?)</div>', content[insert_pos:insert_pos+2000])
        
        if affiliate_match:
            # Insert after affiliate disclosure
            insert_pos += affiliate_match.end()
        
        new_content = content[:insert_pos] + '\n' + disclaimer + content[insert_pos:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return 'pt' if is_pt else 'en'
    except Exception as e:
        print(f"Error: {filepath}: {e}")
        return 'error'

def main():
    """Process all crypto HTML files."""
    crypto_dir = Path('crypto-exchanges-portugal')
    
    if not crypto_dir.exists():
        print("Directory not found")
        return
    
    stats = {'en': 0, 'pt': 0, 'skip': 0, 'error': 0}
    
    for html_file in list(crypto_dir.glob('*.html')) + list(crypto_dir.glob('**/*.html')):
        if 'pt/' in str(html_file) and not html_file.is_file():
            continue
        result = fix_file(html_file)
        stats[result] = stats.get(result, 0) + 1
        if result in ['en', 'pt']:
            print(f"✓ Fixed ({result}): {html_file.name}")
    
    print(f"\n=== SUMMARY ===")
    print(f"English files fixed: {stats['en']}")
    print(f"Portuguese files fixed: {stats['pt']}")
    print(f"Skipped (already has): {stats['skip']}")
    print(f"Errors: {stats['error']}")

if __name__ == '__main__':
    main()