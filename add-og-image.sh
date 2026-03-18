#!/bin/bash

# Map categories to image files
declare -A category_images=(
    ["accounting-software-freelancers"]="accounting.png"
    ["ai-tools-for-realtors"]="ai-tools.png"
    ["ai-writing-tools-authors"]="ai-writing.png"
    ["analytics-tools-apps"]="analytics.png"
    ["best-crm-for-agencies"]="crm.png"
    ["chatbot-platforms-saas"]="chatbot.png"
    ["email-marketing-tools-ecommerce"]="email-marketing.png"
    ["email-verification-tools"]="email-verification.png"
    ["password-managers-teams"]="password-managers.png"
    ["project-management-software-startups"]="project-management.png"
    ["seo-tools-bloggers"]="seo-tools.png"
    ["social-media-schedulers-influencers"]="social-media.png"
    ["video-editing-software-youtubers"]="video-editing.png"
    ["vpn-services-remote-workers"]="vpn.png"
    ["web-hosting-small-business"]="web-hosting.png"
)

# Find all HTML files missing og:image
count=0
for file in $(find /home/node/.openclaw/workspace/seo-network -name "*.html" -type f | grep -v '/.git/' | grep -v '/images/'); do
    if ! grep -q 'og:image' "$file"; then
        # Extract category from path
        dir=$(dirname "$file")
        category=$(basename "$dir")
        
        # Get the image filename
        image_file="${category_images[$category]}"
        
        if [ -n "$image_file" ]; then
            image_url="https://www.toolreviewshub.com/images/$image_file"
            
            # Insert og:image after og:title line
            sed -i "/<meta property=\"og:title\"/a\\  <meta property=\"og:image\" content=\"$image_url\">" "$file"
            
            ((count++))
            echo "[$count] Updated: $file -> $image_url"
        else
            echo "WARNING: No image mapping for category: $category"
        fi
    fi
done

echo ""
echo "=== Summary ==="
echo "Files updated: $count"