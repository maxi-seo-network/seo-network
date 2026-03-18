#!/bin/bash

# Script to add breadcrumb schema to HTML files that don't have it

# Category name mappings (directory slug -> display name)
declare -A CATEGORY_NAMES=(
    ["email-marketing-tools-ecommerce"]="Email Marketing"
    ["best-crm-for-agencies"]="CRM for Agencies"
    ["project-management-software-startups"]="Project Management"
    ["seo-tools-bloggers"]="SEO Tools"
    ["social-media-schedulers-influencers"]="Social Media Schedulers"
    ["video-editing-software-youtubers"]="Video Editing Software"
    ["analytics-tools-apps"]="Analytics Tools"
    ["accounting-software-freelancers"]="Accounting Software"
    ["ai-tools-for-realtors"]="AI Tools for Realtors"
    ["ai-writing-tools-authors"]="AI Writing Tools"
    ["chatbot-platforms-saas"]="Chatbot Platforms"
    ["vpn-services-remote-workers"]="VPN Services"
    ["password-managers-teams"]="Password Managers"
    ["web-hosting-small-business"]="Web Hosting"
    ["email-verification-tools"]="Email Verification Tools"
    ["trading"]="Trading"
)

# Function to get page title from HTML file
get_page_title() {
    local file="$1"
    # Extract title from <title> tag, clean it up
    local title=$(grep -oP '(?<=<title>).*?(?=</title>)' "$file" | head -1 | sed 's/|.*$//' | sed 's/:.*$//' | sed 's/2026//' | sed 's/Complete Guide//' | sed 's/Comparison//' | sed 's/Best //' | sed 's/  */ /g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    echo "$title"
}

# Function to create category breadcrumb schema
create_category_breadcrumb() {
    local category_name="$1"
    local category_url="$2"
    
    cat << EOF
  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.toolreviewshub.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "${category_name}",
        "item": "${category_url}"
      }
    ]
  }
  </script>
EOF
}

# Function to create article breadcrumb schema
create_article_breadcrumb() {
    local category_name="$1"
    local category_url="$2"
    local article_name="$3"
    local article_url="$4"
    
    cat << EOF
  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.toolreviewshub.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "${category_name}",
        "item": "${category_url}"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${article_name}",
        "item": "${article_url}"
      }
    ]
  }
  </script>
EOF
}

# Find all HTML files without BreadcrumbList
echo "Finding HTML files without breadcrumb schema..."

count=0
processed=0

# Process each category directory
for dir in $(find . -maxdepth 2 -type d ! -name ".*" ! -name "images" ! -name "memory" ! -name "scripts" ! -name "trading" | sort); do
    dirname=$(basename "$dir")
    
    # Skip if not a category directory
    [[ -z "${CATEGORY_NAMES[$dirname]}" ]] && continue
    
    category_name="${CATEGORY_NAMES[$dirname]}"
    category_url="https://www.toolreviewshub.com/${dirname}/"
    
    # Process all HTML files in this directory
    for html_file in "$dir"/*.html 2>/dev/null; do
        [[ ! -f "$html_file" ]] && continue
        
        # Check if file already has BreadcrumbList
        if grep -q "BreadcrumbList" "$html_file"; then
            continue
        fi
        
        filename=$(basename "$html_file")
        
        # Determine if this is a category page or article page
        if [[ "$filename" == "index.html" ]]; then
            # Category page - 2 items
            breadcrumb=$(create_category_breadcrumb "$category_name" "$category_url")
            insert_marker="</script>"  # Insert after the last schema block
        else
            # Article page - 3 items
            # Get article title from file
            article_title=$(get_page_title "$html_file")
            article_url="https://www.toolreviewshub.com/${dirname}/${filename}"
            breadcrumb=$(create_article_breadcrumb "$category_name" "$category_url" "$article_title" "$article_url")
        fi
        
        # Find the insertion point - after the last </script> in the head that's part of schema
        # We'll insert after the last FAQ schema or Article schema
        
        # Use awk to insert after the last schema block
        if [[ "$filename" == "index.html" ]]; then
            # For category pages, insert after the last schema </script>
            awk -v breadcrumb="$breadcrumb" '
                /<\/script>/ && in_schema { found_last=NR }
                /<script type="application\/ld\+json">/ { in_schema=1 }
                /<\/script>/ && in_schema { 
                    last_script_end=NR 
                }
                END {
                    print "Found last schema at line " last_script_end > "/dev/stderr"
                }
            ' "$html_file" 2>&1
        fi
        
        # Insert the breadcrumb schema
        # We'll use a Python script for more reliable insertion
        echo "Processing: $html_file"
        ((count++))
    done
done

echo ""
echo "Found $count files to process"