#!/bin/bash
cd /home/node/.openclaw/workspace/seo-network

echo "Fixing H1s..."

# Fix H1s in all directories
for dir in accounting-software-freelancers email-marketing-tools-ecommerce best-crm-for-agencies project-management-software-startups seo-tools-bloggers social-media-schedulers-influencers video-editing-software-youtubers; do
    echo "Processing $dir..."
    for file in "$dir"/*.html; do
        [ -f "$file" ] || continue
        [ "$(basename "$file")" = "index.html" ] && continue
        # Replace generic H1s with more specific ones
        sed -i 's/<h1>Best \([^<]*\) for [^<]* Professionals in 2026<\/h1>/<h1>\1: Complete Review \& Pricing Guide 2026<\/h1>/g' "$file"
    done
done

echo "Done. Files modified:"
git status --short 2>/dev/null | wc -l
