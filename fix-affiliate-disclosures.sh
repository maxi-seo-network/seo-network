#!/bin/bash
cd /home/node/.openclaw/workspace/seo-network

echo "Adding affiliate disclosures to pages missing them..."

# Files missing affiliate disclosure
FILES=(
"email-marketing-tools-ecommerce/index.html"
"email-marketing-tools-ecommerce/email-marketing-tools-ecommerce-for-beginners.html"
"email-marketing-tools-ecommerce/email-marketing-tools-ecommerce-pricing-guide.html"
"analytics-tools-apps/index.html"
"accounting-software-freelancers/quickbooks-freshbooks-xero-comparison.html"
"ai-writing-tools-authors/best-rytr-for-authors.html"
"ai-writing-tools-authors/best-writesonic-for-authors.html"
"best-crm-for-agencies/best-crm-for-agencies-pricing-guide.html"
"best-crm-for-agencies/best-crm-for-agencies-overview.html"
"vpn-services-remote-workers/nordvpn-expressvpn-surfshark-comparison.html"
"crypto-exchanges-portugal/bybit-registration-tutorial.html"
"crypto-exchanges-portugal/nordvpn-portugues.html"
"crypto-exchanges-portugal/best-crypto-app-portugal.html"
"crypto-exchanges-portugal/bitcoin-atm-portugal.html"
"crypto-exchanges-portugal/crypto-taxes-portugal.html"
"crypto-exchanges-portugal/melhor-app-criptomoedas-portugal.html"
"crypto-exchanges-portugal/metamask-tutorial-portugues.html"
"crypto-exchanges-portugal/como-vender-bitcoin-portugal.html"
"crypto-exchanges-portugal/investir-em-criptomoedas-portugal.html"
"crypto-exchanges-portugal/impostos-criptomoedas-portugal.html"
"crypto-exchanges-portugal/criptomoedas-portugal-como-comecar.html"
"crypto-exchanges-portugal/comprar-usdt-portugal.html"
"crypto-exchanges-portugal/crypto-trading-beginners-portugal.html"
"ai-tools-for-realtors/best-claude-for-realtors.html"
"ai-tools-for-realtors/best-jasper-for-realtors.html"
"ai-tools-for-realtors/best-copy-ai-for-realtors.html"
"ai-tools-for-realtors/best-chatgpt-for-realtors.html"
"web-hosting-small-business/bluehost-siteground-wpengine-comparison.html"
"seo-tools-bloggers/ahrefs-vs-semrush.html"
"project-management-software-startups/monday-vs-clickup-vs-asana.html"
)

# Footer template with affiliate disclosure
FOOTER='
<footer>
  <p>&copy; 2026 Tools Reviews Hub. All rights reserved.</p>
  <p><a href="/about.html">About</a> | <a href="/contact.html">Contact</a> | <a href="/privacy.html">Privacy</a> | <a href="/terms.html">Terms</a> | <a href="/affiliate-disclosure.html">Disclosure</a></p>
  <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
    <strong>Affiliate Disclosure:</strong> We participate in affiliate programs including Amazon Associates. When you click links and make purchases, we may earn a commission at no extra cost to you. <a href="/affiliate-disclosure.html" style="color: inherit; text-decoration: underline;">Learn more</a>.
  </p>
</footer>

</body>
</html>'

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Check if file ends with </body></html>
        if grep -q "</body></html>" "$file" 2>/dev/null || grep -q "</html>" "$file" 2>/dev/null; then
            # Remove existing closing tags and footer (if any)
            sed -i 's|</footer>||g' "$file"
            sed -i 's|</body></html>||g' "$file"
            sed -i 's|</body>||g' "$file"
            sed -i 's|</html>||g' "$file"
            
            # Append proper footer
            echo "$FOOTER" >> "$file"
        else
            # Just append footer
            echo "$FOOTER" >> "$file"
        fi
    fi
done

echo "Done. Checking remaining files..."
REMAINING=$(grep -L "affiliate" --include="*.html" -r | wc -l)
echo "Files still missing affiliate disclosure: $REMAINING"