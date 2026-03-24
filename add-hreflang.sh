#!/bin/bash
cd /home/node/.openclaw/workspace/seo-network

echo "Adding hreflang tags..."

# For crypto-exchanges-portugal pages (PT version)
for file in crypto-exchanges-portugal/*.html; do
    [ -f "$file" ] || continue
    filename=$(basename "$file")
    
    # Extract page slug
    slug="${filename%.html}"
    if [ "$slug" = "index" ]; then
        slug=""
    else
        slug="/$slug"
    fi
    
    # Add hreflang after canonical if not present
    if ! grep -q "hreflang" "$file" 2>/dev/null; then
        # Get canonical URL
        canonical=$(grep -oP 'rel="canonical" href="[^"]*"' "$file" | sed 's/rel="canonical" href="//;s/"$//')
        
        if [ -n "$canonical" ]; then
            # Create English version URL
            en_url="${canonical}"
            pt_url="${canonical}"
            
            # Insert hreflang tags after canonical
            sed -i "s|<link rel=\"canonical\" href=\"${canonical}\">|<link rel=\"canonical\" href=\"${canonical}\">\n  <link rel=\"alternate\" hreflang=\"en\" href=\"${en_url}\">\n  <link rel=\"alternate\" hreflang=\"pt\" href=\"${pt_url}\">\n  <link rel=\"alternate\" hreflang=\"x-default\" href=\"${en_url}\">|" "$file"
        fi
    fi
done

# For crypto-exchanges-espana pages (ES version)  
for file in crypto-exchanges-espana/*.html; do
    [ -f "$file" ] || continue
    filename=$(basename "$file")
    
    slug="${filename%.html}"
    if [ "$slug" = "index" ]; then
        slug=""
    else
        slug="/$slug"
    fi
    
    if ! grep -q "hreflang" "$file" 2>/dev/null; then
        canonical=$(grep -oP 'rel="canonical" href="[^"]*"' "$file" | sed 's/rel="canonical" href="//;s/"$//')
        
        if [ -n "$canonical" ]; then
            en_url="${canonical}"
            es_url="${canonical}"
            
            sed -i "s|<link rel=\"canonical\" href=\"${canonical}\">|<link rel=\"canonical\" href=\"${canonical}\">\n  <link rel=\"alternate\" hreflang=\"en\" href=\"${en_url}\">\n  <link rel=\"alternate\" hreflang=\"es\" href=\"${es_url}\">\n  <link rel=\"alternate\" hreflang=\"x-default\" href=\"${en_url}\">|" "$file"
        fi
    fi
done

# Count files with hreflang
ADDED=$(grep -l "hreflang" --include="*.html" -r | wc -l)
echo "Files with hreflang: $ADDED"