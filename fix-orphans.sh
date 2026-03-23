#!/bin/bash
# Fix orphaned pages by adding navigation links

cd /home/node/.openclaw/workspace/seo-network

# Add home link and breadcrumb to all article pages
for dir in accounting-software-freelancers email-marketing-tools-ecommerce best-crm-for-agencies project-management-software-startups seo-tools-bloggers social-media-schedulers-influencers video-editing-software-youtubers analytics-tools-apps ai-tools-for-realtors ai-writing-tools-authors chatbot-platforms-saas vpn-services-remote-workers web-hosting-small-business email-verification-tools password-managers-teams; do
    if [ -d "$dir" ]; then
        echo "Processing $dir..."
        for file in "$dir"/*.html; do
            if [ -f "$file" ]; then
                # Check if already has breadcrumb
                if ! grep -q "breadcrumb" "$file" && [ "$(basename "$file")" != "index.html" ]; then
                    # Add breadcrumb after <nav> or after <header>
                    # This is a placeholder - actual fix needs HTML parsing
                    echo "Would add breadcrumb to: $file"
                fi
            fi
        done
    fi
done

echo "Done. Run HTML parser for actual implementation."