#!/usr/bin/env python3
"""Add financial disclaimer to remaining files."""

import re

FILES = [
    ('crypto-exchanges-portugal/pt/best-crypto-card-europe-2026.html', True),
    ('crypto-exchanges-portugal/pt/melhor-exchange-crypto-portugal-2026.html', True),
    ('crypto-exchanges-portugal/articles/crypto-com-card-europe.html', False),
    ('crypto-exchanges-portugal/articles/okx-review-portugal.html', True),
]

PT_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Aviso:</strong> Este artigo é apenas para fins educativos e não constitui aconselhamento financeiro. Investimentos em criptomoedas acarretam risco significativo, incluindo perda potencial do capital investido. Faça sempre a sua própria investigação e consulte um consultor financeiro qualificado antes de tomar decisões de investimento.
    </div>
'''

EN_DISCLAIMER = '''    <div style="background:#ffe6e6;border:1px solid #fc8181;padding:15px;margin:20px;font-size:14px;border-radius:8px;">
        <strong>⚠️ Disclaimer:</strong> This article is for educational purposes only and does not constitute financial advice. Cryptocurrency investments carry significant risk, including potential loss of principal. Always do your own research and consult a qualified financial advisor before making investment decisions.
    </div>
'''

for filepath, is_pt in FILES:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already has disclaimer
        if 'educational purposes only' in content.lower() or 'fins educ' in content.lower():
            print(f"Skip (already has): {filepath}")
            continue
        
        disclaimer = PT_DISCLAIMER if is_pt else EN_DISCLAIMER
        
        # Find body tag
        match = re.search(r'<body[^>]*>', content, re.IGNORECASE)
        if not match:
            print(f"Error (no body): {filepath}")
            continue
        
        insert_pos = match.end()
        new_content = content[:insert_pos] + '\n' + disclaimer + content[insert_pos:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ Fixed: {filepath}")
    except Exception as e:
        print(f"Error: {filepath}: {e}")

print("\nDone!")