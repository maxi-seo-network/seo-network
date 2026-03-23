#!/bin/bash
# Fix template H1s - more careful approach

cd /home/node/.openclaw/workspace/seo-network

echo "Fixing H1s in accounting-software-freelancers..."

# Create a mapping of filenames to proper tool names
# Extract tool name from filename and create unique H1

for file in accounting-software-freelancers/best-*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .html)
        # Remove "best-" prefix and "-for-freelancers" suffix
        tool=$(echo "$filename" | sed 's/^best-//' | sed 's/-for-freelancers$//' | sed 's/-/ /g')
        # Capitalize first letter of each word
        tool_title=$(echo "$tool" | sed 's/\b\(.\)/\u\1/g')
        # Create new unique H1
        new_h1="${tool_title}: Complete Review & Pricing for Freelancers 2026"
        # Use Perl for exact replacement
        perl -i -pe 's/<h1>Best [^<]+ for Freelancers Professionals in 2026<\/h1>/<h1>'"$new_h1"'<\/h1>/g' "$file"
    fi
done

echo "Done with accounting-software-freelancers H1s"
echo "Sample H1s after fix:"
grep -o "<h1>[^<]*</h1>" accounting-software-freelancers/best-quickbooks-for-freelancers.html
grep -o "<h1>[^<]*</h1>" accounting-software-freelancers/best-xero-for-freelancers.html