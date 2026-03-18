# Google Search Console Setup Checklist

## 🚨 Critical: Site Not Indexed

Your site `toolreviewshub.com` has **0 pages indexed** by Google. This must be fixed immediately.

---

## Step 1: Add Property to GSC

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add property"** → **"URL prefix"**
3. Enter: `https://www.toolreviewshub.com`
4. Choose verification method:

### Option A: HTML File (Recommended)
- Download the verification file Google provides
- Upload to `/seo-network/` root (e.g., `google12345.html`)
- Deploy to Zeabur
- Click "Verify" in GSC

### Option B: DNS Verification
- Add TXT record in your domain DNS
- `_google-site-verification = <verification-code>`
- Takes longer to propagate

### Option C: Google Analytics (if already installed)
- If you have GA4 on the site, verify through that

---

## Step 2: Submit Sitemap

Once verified, submit your sitemap:

1. In GSC, go to **Sitemaps** (left sidebar)
2. Enter sitemap URL: `sitemap-index.xml`
3. Click **Submit**
4. Also submit: `sitemap.xml`

**Your sitemap URLs:**
```
https://www.toolreviewshub.com/sitemap-index.xml
https://www.toolreviewshub.com/sitemap.xml
```

---

## Step 3: Request Indexing for Priority Pages

Manually request indexing for your most important pages:

1. In GSC, use **URL Inspection** tool
2. Enter each URL below
3. Click **"Request indexing"**

### Priority Pages (Submit First)
```
https://www.toolreviewshub.com/
https://www.toolreviewshub.com/about.html
https://www.toolreviewshub.com/email-marketing-tools-ecommerce/
https://www.toolreviewshub.com/best-crm-for-agencies/
https://www.toolreviewshub.com/project-management-software-startups/
https://www.toolreviewshub.com/accounting-software-freelancers/
https://www.toolreviewshub.com/seo-tools-bloggers/
https://www.toolreviewshub.com/ai-tools-for-realtors/
```

**Rate limit:** ~10-20 URLs per day manually

---

## Step 4: Check for Issues

After 24-48 hours, check in GSC:

- [ ] **Coverage report** — Look for errors/warnings
- [ ] **Page Experience** — Core Web Vitals status
- [ ] **Mobile Usability** — Any mobile issues
- [ ] **Security** — Any manual actions

---

## Step 5: Link Google Analytics

If you have GA4:

1. Go to **Admin** → **Data Streams** → Your web stream
2. Copy Measurement ID (`G-XXXXXXXXXX`)
3. Add to site header (already done if AdSense is there)
4. Link GA4 property to GSC for combined data

---

## Common Issues & Fixes

### "Crawled but not indexed"
- Content may be thin or duplicate
- Need more internal links
- Add unique value to each page

### "Duplicate without user-selected canonical"
- Canonical tags are set correctly ✓
- Check for duplicate content across subdirectories

### "Redirect error"
- Check HTTPS redirects
- Verify Zeabur routing

### "Blocked by robots.txt"
- Your robots.txt allows all ✓
- No issue here

---

## Timeline

| Day | Action |
|-----|--------|
| 0 | Add property + verify |
| 0 | Submit sitemaps |
| 0-1 | Request indexing for 10 priority pages |
| 1-3 | Google starts crawling |
| 7-14 | First pages appear in index |
| 14-30 | Full indexing (if no issues) |

---

## Monitoring Commands

Check indexing status:
```bash
# Google index check (manual)
# Go to: https://www.google.com/search?q=site:toolreviewshub.com

# Check sitemap accessibility
curl -I https://www.toolreviewshub.com/sitemap-index.xml
curl -I https://www.toolreviewshub.com/sitemap.xml
```

---

## Next Steps After Indexing

1. Monitor **Search Performance** report weekly
2. Track **impressions → clicks** conversion
3. Identify low-CTR pages, improve titles
4. Add more internal links between articles
5. Build 5-10 quality backlinks

---

**Created:** 2026-03-18
**Status:** PENDING - Needs GSC setup