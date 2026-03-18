#!/bin/bash

# Fix SEO issues: canonical tags and robots meta

BASE_DIR="/home/node/.openclaw/workspace/seo-network"

# Function to add canonical tag after <link rel="stylesheet"...>
add_canonical() {
    local file="$1"
    local category=$(basename $(dirname "$file"))
    local filename=$(basename "$file")
    local canonical_url="https://www.toolreviewshub.com/${category}/${filename}"
    
    # Check if canonical already exists
    if grep -q 'rel="canonical"' "$file" 2>/dev/null; then
        echo "SKIP: $file (already has canonical)"
        return
    fi
    
    # Add canonical after stylesheet link
    if grep -q '<link rel="stylesheet"' "$file"; then
        sed -i "s|<link rel=\"stylesheet\" href=\"/styles.css\">|<link rel=\"stylesheet\" href=\"/styles.css\">\n  <link rel=\"canonical\" href=\"${canonical_url}\">|" "$file"
        echo "FIXED: $file"
    else
        echo "ERROR: No stylesheet link found in $file"
    fi
}

# Function to add robots meta tag
add_robots_meta() {
    local file="$1"
    
    # Check if robots meta already exists
    if grep -q 'name="robots"' "$file" 2>/dev/null; then
        echo "SKIP: $file (already has robots meta)"
        return
    fi
    
    # Add robots meta after viewport meta
    if grep -q '<meta name="viewport"' "$file"; then
        sed -i 's|<meta name="viewport" content="width=device-width, initial-scale=1.0">|<meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="robots" content="index, follow">|' "$file"
        echo "FIXED: $file"
    else
        echo "ERROR: No viewport meta found in $file"
    fi
}

echo "=== FIXING CANONICAL TAGS ==="

# Fix canonical in analytics-tools-apps (102 files)
for f in "$BASE_DIR/analytics-tools-apps"/*.html; do
    add_canonical "$f"
done

echo ""
echo "=== FIXING ROBOTS META TAGS ==="

# Fix robots meta in analytics-tools-apps (5 files)
for f in best-amplitude-for-mobile-apps.html best-firebase-analytics-for-mobile-apps.html best-google-analytics-for-mobile-apps.html best-mixpanel-for-mobile-apps.html google-analytics-vs-mixpanel.html; do
    add_robots_meta "$BASE_DIR/analytics-tools-apps/$f"
done

# Fix robots meta in best-crm-for-agencies (5 files: hubspot, pipedrive, salesforce, zoho, index)
for f in best-hubspot-for-marketing-agencies.html best-pipedrive-for-marketing-agencies.html best-salesforce-for-marketing-agencies.html best-zoho-for-marketing-agencies.html index.html; do
    add_robots_meta "$BASE_DIR/best-crm-for-agencies/$f"
done

# Fix robots meta in project-management-software-startups (3 files)
for f in best-asana-for-startups.html best-monday-for-startups.html index.html; do
    add_robots_meta "$BASE_DIR/project-management-software-startups/$f"
done

echo ""
echo "=== VERIFICATION ==="

echo "Files still missing canonical in analytics-tools-apps:"
grep -L 'rel="canonical"' "$BASE_DIR/analytics-tools-apps"/*.html 2>/dev/null | wc -l

echo ""
echo "Files still missing robots meta:"
for dir in analytics-tools-apps best-crm-for-agencies project-management-software-startups; do
    echo "--- $dir ---"
    grep -L 'name="robots"' "$BASE_DIR/$dir"/*.html 2>/dev/null | wc -l
done