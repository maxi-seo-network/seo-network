#!/bin/bash
# Programmatic SEO Content Generator
# Uses Ollama (qwen3.5:397b-cloud) for content generation

TEMPLATE_DIR="${1:-../content-templates}"
OUTPUT_DIR="${2:-../sites}"
NICHES=("weather" "sports" "finance" "tech" "health" "travel" "food" "gaming" "crypto" "ai")

generate_page() {
    local niche=$1
    local template=$2
    local keyword=$3
    local location=$4
    local output_file=$5

    # Generate content using Ollama
    ollama run qwen3.5:397b-cloud <<EOF
Create an SEO-optimized article following this template: $template
Topic: $keyword in $location
Niche: $niche
Include:
- Title with primary keyword
- Meta description (150-160 chars)
- H1, H2, H3 structure
- Internal linking suggestions
- 800-1200 words
- Natural keyword density (2-3%)
- Call-to-action
EOF
}

# Main generation loop
for niche in "${NICHES[@]}"; do
    echo "Processing niche: $niche"
    mkdir -p "$OUTPUT_DIR/$niche"
    
    # Generate 100 pages per niche (1000 total)
    for i in {1..100}; do
        keyword=$(head -n 1 /dev/urandom | tr -dc 'a-zA-Z' | head -c 10)
        location="City-$i"
        output_file="$OUTPUT_DIR/$niche/page-$i.html"
        
        template_file=$(ls "$TEMPLATE_DIR"/*.md 2>/dev/null | head -n 1)
        if [ -f "$template_file" ]; then
            template=$(cat "$template_file")
        else
            template="best X in Y"
        fi
        
        generate_page "$niche" "$template" "$keyword" "$location" "$output_file"
        echo "Generated: $output_file"
    done
done

echo "Content generation complete!"
