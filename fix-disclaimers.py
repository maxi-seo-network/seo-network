#!/usr/bin/env python3
"""
Add financial disclaimer AND affiliate disclosure to all crypto-related HTML files.
Run from seo-network directory.
"""

import os
import re
from pathlib import Path

# Templates
ENGLISH_AFFILIATE = '''    <div style="background:#f0f9ff;border:1px solid #3b82f6;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>Affiliate Disclosure:</strong> This article contains affiliate links. If you purchase through these links, we may earn a commission at no extra cost to you.
    </div>
'''

PORTUGUESE_AFFILIATE = '''    <div style="background:#f0f9ff;border:1px solid #3b82f6;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>Aviso de Afiliado:</strong> Este artigo contém links de afiliado. Se comprar através destes links, podemos ganhar uma comissão sem custo adicional.
    </div>
'''

ENGLISH_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Disclaimer:</strong> This article is for educational purposes only and does not constitute financial advice. Cryptocurrency investments carry significant risk, including potential loss of principal. Always do your own research and consult a qualified financial advisor before making investment decisions.
    </div>
'''

PORTUGUESE_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Aviso:</strong> Este artigo é apenas para fins educativos e não constitui aconselhamento financeiro. Investimentos em criptomoedas acarretam risco significativo, incluindo perda potencial do capital investido. Faça sempre a sua própria investigação e consulte um consultor financeiro qualificado antes de tomar decisões de investimento.
    </div>
'''

def has_content(content, patterns):
    """Check if any pattern exists in content."""
    for pattern in patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True
    return False

def is_portuguese(filepath, content):
    """Detect if file is Portuguese."""
    if 'portugal' in filepath.lower() and '_pt_' not in filepath.lower():
        # Check for PT indicators
        if re.search(r'lang=["\']pt', content, re.IGNORECASE):
            return True
        pt_words = ['como', 'para', 'melhor', 'comprar', 'carteira', 'taxas', 'segurança', 'portugu', 'exchange', 'cripto']
        en_words = ['how', 'best', 'buy', 'wallet', 'fees', 'security', 'guide', 'review']
        pt_count = sum(1 for w in pt_words if w.lower() in content.lower()[:2000])
        en_count = sum(1 for w in en_words if w.lower() in content.lower()[:2000])
        return pt_count > en_count
    return False

def add_disclosures(filepath):
    """Add both affiliate disclosure and financial disclaimer to a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        has_affiliate = has_content(content, [
            r'Affiliate Disclosure',
            r'Aviso de Afiliado',
            r'affiliate links',
            r'links de afiliado'
        ])
        
        has_disclaimer = has_content(content, [
            r'educational purposes only',
            r'fins educativos',
            r'Financial Disclaimer',
            r'does not constitute financial advice'
        ])
        
        if has_affiliate and has_disclaimer:
            return 'skip'
        
        is_pt = is_portuguese(str(filepath), content)
        affiliate = PORTUGUESE_AFFILIATE if is_pt else ENGLISH_AFFILIATE
        disclaimer = PORTUGUESE_DISCLAIMER if is_pt else ENGLISH_DISCLAIMER
        
        # Find body tag
        body_match = re.search(r'<body[^>]*>', content, re.IGNORECASE)
        if not body_match:
            return 'error'
        
        insert_pos = body_match.end()
        
        # Build what to insert
        to_insert = ''
        if not has_affiliate:
            to_insert += '\n' + affiliate
        if not has_disclaimer:
            to_insert += '\n' + disclaimer
        
        if to_insert:
            new_content = content[:insert_pos] + to_insert + '\n' + content[insert_pos:]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return 'pt' if is_pt else 'en'
        
        return 'skip'
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
    
    for html_file in crypto_dir.glob('*.html'):
        result = add_disclosures(html_file)
        stats[result] = stats.get(result, 0) + 1
        if result in ['en', 'pt']:
            print(f"✓ Fixed ({result}): {html_file.name}")
    
    print(f"\n=== SUMMARY ===")
    print(f"English files fixed: {stats['en']}")
    print(f"Portuguese files fixed: {stats['pt']}")
    print(f"Skipped (already complete): {stats['skip']}")
    print(f"Errors: {stats['error']}")
    print(f"Total processed: {sum(stats.values())}")

if __name__ == '__main__':
    main()