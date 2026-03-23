#!/bin/bash
# Fix template H1s and add breadcrumbs to all directories

cd /home/node/.openclaw/workspace/seo-network

# Fix H1s in accounting-software-freelancers
echo "Fixing accounting-software-freelancers..."
for file in accounting-software-freelancers/*.html; do
    if [ "$(basename "$file")" != "index.html" ]; then
        # Extract tool name from filename
        tool=$(basename "$file" .html | sed 's/best-//' | sed 's/-for-freelancers//' | sed 's/-/ /g')
        # Create unique H1
        new_h1="<h1>${tool^}: Complete Review & Pricing Guide for Freelancers 2026</h1>"
        # Replace generic H1
        sed -i "s|<h1>Best .* for Freelancers Professionals in 2026</h1>|$new_h1|g" "$file"
        sed -i "s|<h1>Best .* Professionals in 2026</h1>|$new_h1|g" "$file"
    fi
done

# Fix H1s in email-marketing-tools-ecommerce
echo "Fixing email-marketing-tools-ecommerce..."
for file in email-marketing-tools-ecommerce/*.html; do
    if [ "$(basename "$file")" != "index.html" ]; then
        tool=$(basename "$file" .html | sed 's/best-//' | sed 's/-vs-/, /' | sed 's/-/ /g')
        new_h1="<h1>${tool^}: Email Marketing Guide for E-commerce 2026</h1>"
        sed -i "s|<h1>Best .* for .* Professionals in 2026</h1>|$new_h1|g" "$file"
        sed -i "s|<h1>.* vs .*: .* for .* 2026</h1>|$new_h1|g" "$file"
    fi
done

# Fix H1s in best-crm-for-agencies
echo "Fixing best-crm-for-agencies..."
for file in best-crm-for-agencies/*.html; do
    if [ "$(basename "$file")" != "index.html" ]; then
        tool=$(basename "$file" .html | sed 's/best-//' | sed 's/-crm/ CRM/' | sed 's/-/ /g')
        new_h1="<h1>${tool^}: CRM Guide for Agencies 2026</h1>"
        sed -i "s|<h1>Best .* for .* Professionals in 2026</h1>|$new_h1|g" "$file"
    fi
done

# Fix H1s in project-management-software-startups
echo "Fixing project-management-software-startups..."
for file in project-management-software-startups/*.html; do
    if [ "$(basename "$file")" != "index.html" ]; then
        tool=$(basename "$file" .html | sed 's/best-//' | sed 's/-/ /g')
        new_h1="<h1>${tool^}: Project Management Guide for Startups 2026</h1>"
        sed -i "s|<h1>Best .* for .* Professionals in 2026</h1>|$new_h1|g" "$file"
    fi
done

# Fix H1s in seo-tools-bloggers
echo "Fixing seo-tools-bloggers..."
for file in seo-tools-bloggers/*.html; do
    if [ "$(basename "$file")" != "index.html" ]; then
        tool=$(basename "$file" .html | sed 's/best-//' | sed 's/-/ /g')
        new_h1="<h1>${tool^}: SEO Tools Guide for Bloggers 2026</h1>"
        sed -i "s|<h1>Best .* for .* Professionals in 2026</h1>|$new_h1|g" "$file"
    fi
done

# Fix H1s in social-media-schedulers-influencers
echo "Fixing social-media-schedulers-influencers..."
for file in social-media-schedulers-influencers/*.html; do
    if [ "$(basename "$file")" != "index.html" ]; then
        tool=$(basename "$file" .html | sed 's/best-//' | sed 's/-/ /g')
        new_h1="<h1>${tool^}: Social Media Guide for Influencers 2026</h1>"
        sed -i "s|<h1>Best .* for .* Professionals in 2026</h1>|$new_h1|g" "$file"
    fi
done

# Fix H1s in video-editing-software-youtubers
echo "Fixing video-editing-software-youtubers..."
for file in video-editing-software-youtubers/*.html; do
    if [ "$(basename "$file")" != "index.html" ]; then
        tool=$(basename "$file" .html | sed 's/best-//' | sed 's/-/ /g')
        new_h1="<h1>${tool^}: Video Editing Guide for YouTubers 2026</h1>"
        sed -i "s|<h1>Best .* for .* Professionals in 2026</h1>|$new_h1|g" "$file"
    fi
done

echo "H1 fixes complete. Now adding breadcrumbs..."

# Add breadcrumbs to all article pages
for dir in accounting-software-freelancers email-marketing-tools-ecommerce best-crm-for-agencies project-management-software-startups seo-tools-bloggers social-media-schedulers-influencers video-editing-software-youtubers analytics-tools-apps ai-tools-for-realtors ai-writing-tools-authors chatbot-platforms-saas vpn-services-remote-workers web-hosting-small-business email-verification-tools password-managers-teams; do
    if [ -d "$dir" ]; then
        echo "Adding breadcrumbs to $dir..."
        for file in "$dir"/*.html; do
            if [ "$(basename "$file")" != "index.html" ]; then
                # Check if breadcrumb already exists
                if ! grep -q "breadcrumb" "$file"; then
                    # Add breadcrumb after <body> or before <h1>
                    article=$(basename "$file" .html | sed 's/-/ /g')
                    breadcrumb="<nav class=\"breadcrumbs\"><a href=\"/\">Home</a> &gt; <a href=\"/$dir/\">${dir^}</a> &gt; <span>${article}</span></nav>"
                    # Insert after <body> tag
                    sed -i "s|<body>|<body>\n$breadcrumb|" "$file"
                fi
            fi
        done
    fi
done

echo "All fixes complete!"