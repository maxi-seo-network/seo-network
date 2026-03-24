#!/bin/bash
cd /home/node/.openclaw/workspace/seo-network

echo "Updating Bybit links with affiliate ID 156767..."

# Update all Bybit links to use partner.bybit.com affiliate link
find . -name "*.html" -type f -exec sed -i \
    -e 's|https://www\.bybit\.com"|https://partner.bybit.com/b/156767"|g' \
    -e 's|https://www\.bybit\.com/|https://partner.bybit.com/b/156767|g' \
    -e 's|https://bybit\.com"|https://partner.bybit.com/b/156767"|g' \
    -e 's|https://bybit\.com/|https://partner.bybit.com/b/156767|g' \
    -e 's|bybit\.com/register?ref=YOUR_BYBIT_ID|partner.bybit.com/b/156767|g' \
    -e 's|ref=YOUR_BYBIT_ID|ref=156767|g' \
    {} \;

# Count changes
echo "Updated Bybit links in $(grep -l 'partner.bybit.com/b/156767' --include='*.html' -r | wc -l) files"