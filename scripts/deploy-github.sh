#!/bin/bash
# Deploy sites to GitHub Pages
# Usage: ./deploy-github.sh <site-name>

set -e

SITE_NAME=${1:-$(cat ../build/build-manifest.json | jq -r '.sites[0].name')}
GITHUB_ORG=${GITHUB_ORG:-maxi-seo-network}
REPO_NAME=$SITE_NAME
BUILD_DIR="../build/$SITE_NAME"
TEMP_REPO="/tmp/$REPO_NAME-$$"

echo "🚀 Deploying $SITE_NAME to GitHub Pages..."

# Create GitHub repo if it doesn't exist (requires gh CLI)
if command -v gh &> /dev/null; then
  echo "📋 Checking/creating GitHub repository..."
  gh repo create "$GITHUB_ORG/$REPO_NAME" --public --confirm 2>/dev/null || true
else
  echo "⚠️  GitHub CLI not found. Please create repo manually: https://github.com/new"
  echo "   Repository: $GITHUB_ORG/$REPO_NAME"
fi

# Clone repo
echo "📦 Cloning repository..."
rm -rf "$TEMP_REPO"
git clone "https://github.com/$GITHUB_ORG/$REPO_NAME.git" "$TEMP_REPO" 2>/dev/null || {
  # If clone fails, init new repo
  mkdir -p "$TEMP_REPO"
  cd "$TEMP_REPO"
  git init
  git remote add origin "https://github.com/$GITHUB_ORG/$REPO_NAME.git"
}

cd "$TEMP_REPO"

# Configure git
git config user.email "seo-network@automation.local"
git config user.name "SEO Network Bot"

# Checkout or create gh-pages branch
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages

# Clean and copy new build
rm -rf *
cp -r "$BUILD_DIR"/* .

# Add sitemap and robots if missing
[ -f sitemap.xml ] || echo "Sitemap should exist from build"
[ -f robots.txt ] || echo "Robots.txt should exist from build"

# Commit and push
git add -A
git commit -m "Deploy $(date -Iseconds) - Auto-generated SEO content" || true
git push -u origin gh-pages --force

# Cleanup
cd /
rm -rf "$TEMP_REPO"

echo "✅ Deployed successfully!"
echo "🌐 Live URL: https://$GITHUB_ORG.github.io/$REPO_NAME/"

# Output deployment info
cat << EOF

DEPLOYMENT COMPLETE
===================
Site: $SITE_NAME
URL: https://$GITHUB_ORG.github.io/$REPO_NAME/
Branch: gh-pages
Deployed: $(date -Iseconds)

NEXT STEPS:
1. Verify site loads correctly
2. Submit sitemap to Google Search Console
3. Set up Google Analytics
4. Add AdSense code (pending approval)
5. Configure custom domain (optional)

EOF
