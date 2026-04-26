#!/usr/bin/env python3
"""
Add financial disclaimer to all crypto-related HTML files that don't have it.
Run from seo-network directory.
"""

import os
import re
from pathlib import Path

# Financial disclaimer templates
ENGLISH_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Disclaimer:</strong> This article is for educational purposes only and does not constitute financial advice. Cryptocurrency investments carry significant risk, including potential loss of principal. Always do your own research and consult a qualified financial advisor before making investment decisions.
    </div>
'''

PORTUGUESE_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Aviso:</strong> Este artigo é apenas para fins educativos e não constitui aconselhamento financeiro. Investimentos em criptomoedas acarretam risco significativo, incluindo perda potencial do capital investido. Faça sempre a sua própria investigação e consulte um consultor financeiro qualificado antes de tomar decisões de investimento.
    </div>
'''

def has_financial_disclaimer(content):
    """Check if file already has financial disclaimer."""
    patterns = [
        r'educational purposes only',
        r'fins educativos',
        r'fins educatifs',
        r'educational purposes only',
        r'does not constitute financial advice',
        r'não constitui aconselhamento financeiro'
    ]
    for pattern in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True
    return False

def is_portuguese(content):
    """Detect if file is Portuguese based on language meta or content."""
    if re.search(r'lang=["\']pt', content, re.IGNORECASE):
        return True
    if re.search(r'hreflang=["\']pt', content, re.IGNORECASE):
        return True
    # Check for Portuguese-specific words
    pt_words = ['cripitomoedas', 'carteira', 'comprar', 'exchange', 'taxas', 'segurança', 'portugu', 'melhor']
    en_words = ['cryptocurrency', 'wallet', 'buy', 'exchange', 'fees', 'security', 'best']
    
    pt_count = sum(1 for w in pt_words if w.lower() in content.lower())
    en_count = sum(1 for w in en_words if w.lower() in content.lower())
    
    return pt_count > en_count

def add_disclaimer(content, is_pt):
    """Add financial disclaimer after body tag or after affiliate disclosure."""
    disclaimer = PORTUGUESE_DISCLAIMER if is_pt else ENGLISH_DISCLAIMER
    
    # Try to insert after affiliate disclosure
    affiliate_pattern = r'(<div[^>]*>[\s\S]*?(?:Affiliate Disclosure|Aviso de Afiliado)[\s\S]*?</div>)'
    match = re.search(affiliate_pattern, content, re.IGNORECASE)
    
    if match:
        # Insert after affiliate disclosure div
        insert_pos = match.end()
        # Check if there's already a disclaimer right after
        remaining = content[insert_pos:insert_pos+500]
        if 'educational purposes' not in remaining.lower() and 'fins educativos' not in remaining.lower():
            return content[:insert_pos] + '\n' + disclaimer + content[insert_pos:]
    
    # Otherwise insert after <body>
    body_match = re.search(r'<body[^>]*>', content, re.IGNORECASE)
    if body_match:
        insert_pos = body_match.end()
        return content[:insert_pos] + '\n' + disclaimer + content[insert_pos:]
    
    # Last resort: insert at start of body content
    return content

def process_file(filepath):
    """Process a single HTML file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if has_financial_disclaimer(content):
            return 'skip'
        
        is_pt = is_portuguese(content)
        new_content = add_disclaimer(content, is_pt)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return 'pt' if is_pt else 'en'
        return 'error'
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 'error'

def main():
    """Main function to process all crypto-related HTML files."""
    # Directories to process
    crypto_dirs = ['crypto-exchanges-portugal', 'crypto-exchanges-espana', 'crypto-vpn-guide']
    
    stats = {'en': 0, 'pt': 0, 'skip': 0, 'error': 0}
    
    for directory in crypto_dirs:
        dir_path = Path(directory)
        if not dir_path.exists():
            continue
        
        for html_file in dir_path.glob('*.html'):
            result = process_file(html_file)
            stats[result] = stats.get(result, 0) + 1
            if result in ['en', 'pt']:
                print(f"✓ Added disclaimer ({result}): {html_file.name}")
    
    print(f"\n=== SUMMARY ===")
    print(f"English disclaimers added: {stats['en']}")
    print(f"Portuguese disclaimers added: {stats['pt']}")
    print(f"Skipped (already has): {stats['skip']}")
    print(f"Errors: {stats['error']}")

if __name__ == '__main__':
    main()