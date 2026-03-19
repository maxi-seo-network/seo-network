#!/bin/bash
# Fix Portugal crypto tax information in all articles
# Portugal introduced 28% tax on short-term crypto gains in 2023

cd /home/node/.openclaw/workspace/seo-network/crypto-exchanges-portugal

# Add tax disclaimer and correct information
for file in *.html; do
  # Fix the FAQ tax answer
  sed -i 's/capital gains from cryptocurrency investments may be tax-exempt for personal investors/capital gains from crypto held for MORE than one year may be tax-free, but crypto held LESS than one year is taxed at 28%%/g' "$file"
  
  # Fix tax claims
  sed -i 's/capital gains may be tax-exempt for individual investors/crypto gains are tax-free if held over 365 days, otherwise taxed at 28%%/g' "$file"
  
  # Fix the "favorable tax treatment" paragraph
  sed -i 's/generally not subject to VAT, and capital gains from cryptocurrency investments may be tax-exempt for individual investors who do not engage in professional trading/subject to VAT clarification, and crypto gains are taxed at 28%% if held less than one year (tax-free after 365 days)/g' "$file"
  
  # Fix the intro paragraph about tax advantages
  sed -i 's/offering tax advantages/offering competitive tax rates (28%% on short-term gains)/g' "$file"
  
  # Add disclaimer after tax section
  if grep -q "Taxes and Regulations" "$file"; then
    sed -i 's|<h2>Taxes and Regulations in Portugal</h2>|<h2>Taxes and Regulations in Portugal</h2>\n            <p><strong>Important:</strong> Tax laws change frequently. As of 2023, Portugal taxes short-term crypto gains (held less than 365 days) at 28%%. Crypto held longer than one year may be tax-free. Always consult a Portuguese tax professional for personalized advice.</p>|g' "$file"
  fi
done

echo "Tax information corrected in all articles"