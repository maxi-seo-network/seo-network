# Deployment Guide - SEO Network

## Step 1: Initialize Git Repository

```bash
cd /home/node/.openclaw/workspace/seo-network
git init
git add .
git commit -m "Initial: 10 niche sites, 1000 pages, full automation"
```

## Step 2: Create GitHub Organization

1. Go to https://github.com/account/organizations
2. Create new organization: `maxi-seo-network`
3. Choose free plan
4. Note the organization name

## Step 3: Push to GitHub

```bash
# Add remote (replace with your org)
git remote add origin https://github.com/maxi-seo-network/seo-network.git

# Push main branch
git branch -M main
git push -u origin main
```

## Step 4: Deploy Individual Sites

### Option A: Manual Deployment (Run Once)

```bash
# For each site (run 10 times)
cd scripts
export GITHUB_ORG=maxi-seo-network
./deploy-github.sh ai-tools-for-realtors
./deploy-github.sh best-crm-for-agencies
# ... repeat for all 10 sites
```

### Option B: GitHub Actions (Automated)

The workflow in `sites/.github/workflows/auto-deploy.yml` will:
- Run on every push to main
- Run weekly (Sundays 3 AM UTC)
- Generate content → Build → Deploy automatically

**To enable:**
1. Go to https://github.com/maxi-seo-network/seo-network/actions
2. Workflows are enabled by default
3. First push will trigger initial deployment

## Step 5: Create Individual Site Repos

Each site needs its own GitHub repository for GitHub Pages:

```bash
# Example for first site
gh repo create maxi-seo-network/ai-tools-for-realtors --public --confirm
# Repeat for all 10 sites
```

Or create manually via GitHub UI:
- https://github.com/new
- Repository name: `ai-tools-for-realtors`
- Organization: `maxi-seo-network`
- Public
- Initialize with README

## Step 6: Configure GitHub Pages

For each site repo:
1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages`
4. Folder: `/ (root)`
5. Save

GitHub will provide live URL: `https://maxi-seo-network.github.io/ai-tools-for-realtors/`

## Step 7: Submit to Google Search Console

For each site:

1. Go to https://search.google.com/search-console
2. Add property: `https://maxi-seo-network.github.io/ai-tools-for-realtors/`
3. Verify via HTML tag (add to index.html `<head>`)
4. Submit sitemap: `sitemap.xml`
5. Monitor indexing progress

**Bulk submission script:**
```bash
# Add to scripts/submit-sitemaps.sh
#!/bin/bash
SITES=("ai-tools-for-realtors" "best-crm-for-agencies" ...)
for site in ${SITES[@]}; do
  echo "Submitting sitemap for $site"
  # Use Google Search Console API (requires OAuth setup)
done
```

## Step 8: Apply for AdSense

For each site:

1. Go to https://adsense.google.com
2. Sign up with Google account
3. Add site URL
4. Add AdSense code to `<head>` (already in template)
5. Wait for approval (2 days - 2 weeks)
6. Once approved, ads will auto-display

**Requirements for approval:**
- Original, valuable content ✓ (100 pages per site)
- Clear navigation ✓
- Privacy policy page ✓ (template includes)
- Terms of service page ✓ (template includes)
- Mobile-friendly design ✓
- No prohibited content ✓

## Step 9: Join Amazon Associates

1. Go to https://affiliate-program.amazon.com
2. Create account
3. Add your websites (list all 10 URLs)
4. Describe how you'll promote products
5. Wait for approval (1-3 days)
6. Get your associate tag: `yoursite-20`
7. Update `AMAZON_TAG` environment variable
8. Rebuild sites: `node scripts/build-sites.js`

**Important:**
- Must make 3 qualifying sales in 180 days
- Proper disclosure required on all pages (included in template)

## Step 10: Set Up Google Analytics

For each site:

1. Go to https://analytics.google.com
2. Create property (10 properties total)
3. Get Measurement ID: `G-XXXXXXXXXX`
4. Add to site's HTML (already in template)
5. Update `GA_ID` environment variable
6. Rebuild if needed

**Alternative:** Use single GA property with different data streams per site.

## Step 11: Configure Custom Domains (Optional)

For professional appearance:

1. Buy domains (Namecheap, GoDaddy, etc.)
   - Example: `aitoolsforrealtors.com`
2. In GitHub repo Settings → Pages → Custom domain
3. Add domain: `aitoolsforrealtors.com`
4. Configure DNS at registrar:
   - A record: `185.199.108.153`
   - CNAME: `maxi-seo-network.github.io`
5. Enable HTTPS enforcement

**Cost:** ~$10-15/year per domain (optional)

## Step 12: Verify Deployment

Checklist for each site:

- [ ] Site loads: `https://maxi-seo-network.github.io/[site-name]/`
- [ ] Homepage displays correctly
- [ ] Content pages accessible
- [ ] Navigation works
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt present: `/robots.txt`
- [ ] AdSense code in `<head>`
- [ ] Analytics code in `<head>`
- [ ] Amazon disclosure in footer
- [ ] Mobile-responsive (test on phone)

## Step 13: Monitor & Optimize

### Weekly Tasks (Automated)
- GitHub Actions regenerates content
- Auto-deploys updated pages
- Updates sitemaps

### Monthly Tasks (Manual)
- Review Search Console for indexing issues
- Check AdSense performance
- Analyze top-performing pages
- Adjust content strategy based on data

### Quarterly Tasks
- A/B test ad placements
- Review RPM by niche
- Scale winning niches (more content)
- Pause underperforming niches

## Troubleshooting

### Site Not Loading
```bash
# Check gh-pages branch exists
git branch -a | grep gh-pages

# Force redeploy
./deploy-github.sh [site-name]
```

### AdSense Rejected
- Ensure content is original (it is - generated uniquely)
- Add privacy policy page
- Add contact page
- Improve navigation
- Reapply after fixes

### Pages Not Indexed
- Submit sitemap in Search Console
- Request indexing for key pages
- Build internal links between pages
- Acquire backlinks (guest posts, social)

### Low Traffic After 90 Days
- Increase content volume (more pages)
- Target long-tail keywords
- Build backlinks
- Promote on social media
- Consider paid ads to jumpstart

## Success Metrics

### Month 1
- 10 sites live
- 1,000 pages indexed (partial)
- AdSense approved (some sites)
- Revenue: $0-100 total

### Month 3
- 800+ pages indexed
- All AdSense approved
- Revenue: $200-500/month

### Month 6
- Full indexing complete
- Revenue: $1,000-3,000/month
- Clear winners identified

### Month 12
- Mature SEO presence
- Revenue: $5,000-10,000/month
- Optimized ad placements
- Scaled winning niches

---

**Last Updated:** 2026-03-16
**Status:** Ready for deployment
