#!/bin/bash
cd /home/node/.openclaw/workspace/seo-network

echo "Fixing remaining directories..."

# Fix H1s in remaining directories
for dir in analytics-tools-apps ai-tools-for-realtors ai-writing-tools-authors chatbot-platforms-saas vpn-services-remote-workers web-hosting-small-business email-verification-tools password-managers-teams; do
    echo "Processing $dir..."
    for file in "$dir"/*.html; do
        [ -f "$file" ] || continue
        [ "$(basename "$file")" = "index.html" ] && continue
        # Replace generic H1s
        sed -i 's/<h1>Best \([^<]*\) for [^<]* Professionals in 2026<\/h1>/<h1>\1: Complete Review \& Pricing Guide 2026<\/h1>/g' "$file"
        sed -i 's/<h1>Best \([^<]*\) in 2026<\/h1>/<h1>\1: Complete Review \& Guide 2026<\/h1>/g' "$file"
    done
done

echo "Done. Files modified:"
git status --short 2>/dev/null | wc -l
