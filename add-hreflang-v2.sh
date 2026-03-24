#!/bin/bash
cd /home/node/.openclaw/workspace/seo-network

echo "Adding hreflang tags to all pages..."

# Add hreflang after canonical link in all HTML files
find . -name "*.html" -type f | while read file; do
    # Skip if already has hreflang
    if grep -q "hreflang" "$file" 2>/dev/null; then
        continue
    fi
    
    # Get the directory and filename
    dir=$(dirname "$file")
    filename=$(basename "$file")
    slug="${filename%.html}"
    
    # Skip root files like index.html, about.html etc
    case "$dir" in
        .)
            continue
            ;;
    esac
    
    # Extract canonical URL from file
    canonical=$(grep -oP 'rel="canonical" href="[^"]*"' "$file" 2>/dev/null | sed 's/rel="canonical" href="//;s/"$//' | head -1)
    
    if [ -z "$canonical" ]; then
        continue
    fi
    
    # Determine language based on directory
    lang="en"
    case "$dir" in
        *-espana*|*-es)
            lang="es"
            ;;
        *-portugal*|*-pt*)
            lang="pt"
            ;;
    esac
    
    # Create hreflang tags
    if [ "$lang" = "en" ]; then
        hreflang_tags="  <link rel=\"alternate\" hreflang=\"en\" href=\"${canonical}\">
  <link rel=\"alternate\" hreflang=\"x-default\" href=\"${canonical}\">"
    else
        # For non-English, still add en and x-default pointing to English equivalent if possible
        en_url=$(echo "$canonical" | sed "s|/${lang}/|/en/|g" | sed "s|-${lang}|-en|g")
        hreflang_tags="  <link rel=\"alternate\" hreflang=\"${lang}\" href=\"${canonical}\">
  <link rel=\"alternate\" hreflang=\"x-default\" href=\"${canonical}\">"
    fi
    
    # Insert after canonical line
    sed -i "/<link rel=\"canonical\"/a\\$hreflang_tags" "$file"
done

# Count results
echo "Files with hreflang: $(grep -l 'hreflang' --include='*.html' -r | wc -l)"