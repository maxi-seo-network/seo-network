#!/bin/bash
cd /home/node/.openclaw/workspace/seo-network

echo "Fixing titles, meta tags, and schema headlines..."

# Count files before
BEFORE=$(grep -l "for.*Professionals in 2026" --include="*.html" -r | wc -l)
echo "Files with generic pattern: $BEFORE"

# Fix all directories
for dir in accounting-software-freelancers ai-tools-for-realtors analytics-tools-apps best-crm-for-agencies chatbot-platforms-saas email-marketing-tools-ecommerce project-management-software-startups seo-tools-bloggers social-media-schedulers-influencers video-editing-software-youtubers email-verification-tools password-managers-teams vpn-services-remote-workers web-hosting-small-business ai-writing-tools-authors; do
    if [ -d "$dir" ]; then
        echo "Processing $dir..."
        for file in "$dir"/*.html; do
            [ -f "$file" ] || continue
            
            # Extract the tool name from filename
            # e.g., best-surfer-seo-for-e-commerce.html -> Surfer SEO
            basename=$(basename "$file" .html)
            
            # Skip index.html
            [ "$basename" = "index" ] && continue
            
            # Create a better title
            # Remove "best-" prefix and "-for-X" suffix, then title case
            toolname=$(echo "$basename" | sed 's/^best-//' | sed 's/-for-.*//' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
            
            # Fix title tag
            sed -i "s|<title>Best ${toolname} for [^<]* Professionals in 2026</title>|<title>${toolname}: Complete Review \& Pricing Guide 2026</title>|g" "$file"
            
            # Fix og:title
            sed -i "s|<meta property=\"og:title\" content=\"Best ${toolname} for [^\"]* Professionals in 2026\">|<meta property=\"og:title\" content=\"${toolname}: Complete Review \& Pricing Guide 2026\">|g" "$file"
            
            # Fix twitter:title
            sed -i "s|<meta name=\"twitter:title\" content=\"Best ${toolname} for [^\"]* Professionals in 2026\">|<meta name=\"twitter:title\" content=\"${toolname}: Complete Review \& Pricing Guide 2026\">|g" "$file"
        done
    fi
done

# More generic fix for any remaining patterns
for file in $(grep -l "for.*Professionals in 2026" --include="*.html" -r); do
    # Fix title - capture the tool name and make it better
    sed -i 's|<title>Best \([^<]*\) for [^<]* Professionals in 2026</title>|<title>\1: Complete Review \& Pricing Guide 2026</title>|g' "$file"
    
    # Fix og:title  
    sed -i 's|<meta property="og:title" content="Best \([^"]*\) for [^"]* Professionals in 2026">|<meta property="og:title" content="\1: Complete Review \& Pricing Guide 2026">|g' "$file"
    
    # Fix twitter:title
    sed -i 's|<meta name="twitter:title" content="Best \([^"]*\) for [^"]* Professionals in 2026">|<meta name="twitter:title" content="\1: Complete Review \& Pricing Guide 2026">|g' "$file"
    
    # Fix schema headline
    sed -i 's|"headline": "Best \([^"]*\) for [^"]* Professionals in 2026"|"headline": "\1: Complete Review \& Pricing Guide 2026"|g' "$file"
done

# Count after
AFTER=$(grep -l "for.*Professionals in 2026" --include="*.html" -r | wc -l)
echo "Files with generic pattern after fix: $AFTER"
echo "Fixed: $((BEFORE - AFTER)) files"