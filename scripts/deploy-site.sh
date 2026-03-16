#!/bin/bash
# Deploy SEO sites to GitHub Pages / Netlify
# Usage: ./deploy-site.sh <site-name> <platform>

SITE_NAME=$1
PLATFORM=${2:-github}  # github or netlify
SITE_DIR="../sites/$SITE_NAME"

# Initialize git repo if needed
cd "$SITE_DIR" || exit 1
git init
git checkout -b main 2>/dev/null || git checkout main

# Generate sitemap.xml
cat > sitemap.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
EOF

# Add all HTML pages to sitemap
find . -name "*.html" -type f | while read -r page; do
    url="https://${SITE_NAME}.github.io${page#.}"
    echo "  <url>"
    echo "    <loc>${url}</loc>"
    echo "    <lastmod>$(date -Iseconds)</lastmod>"
    echo "    <changefreq>weekly</changefreq>"
    echo "    <priority>0.8</priority>"
    echo "  </url>"
done >> sitemap.xml

cat >> sitemap.xml <<EOF
</urlset>
EOF

# Create robots.txt
cat > robots.txt <<EOF
User-agent: *
Allow: /
Sitemap: https://${SITE_NAME}.github.io/sitemap.xml
EOF

# Add Adsense placeholder (replace with actual publisher ID)
cat > adsense.txt <<EOF
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
EOF

# Commit and prepare for push
git add .
git commit -m "Deploy: $(date) - $(find . -name '*.html' | wc -l) pages"

echo "Site ready for deployment to $PLATFORM"
echo "Next steps:"
echo "  GitHub: git remote add origin <repo-url> && git push -u origin main"
echo "  Netlify: netlify deploy --prod --dir=."
