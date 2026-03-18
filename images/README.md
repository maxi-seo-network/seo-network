# OG Image Generation Guide

## Current Status
- 16 SVG files created for social sharing
- SVGs work on Twitter/X and LinkedIn
- Facebook prefers PNG/JPG

## Quick Convert Options

### Option 1: CloudConvert (Online)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload all SVG files
3. Set size: 1200x630 pixels
4. Download PNGs
5. Replace SVG references with PNG in HTML

### Option 2: Run Locally with Python
```bash
pip install pillow
python3 scripts/create_images.py
```

### Option 3: Use Canva
1. Create "Social Media > Facebook Post" (1200x630)
2. Apply gradient: #667eea → #764ba2
3. Add text: Category Name + "Tools Reviews Hub"
4. Export as PNG
5. Upload to /images/

## File List
- email-marketing.svg → Email Marketing for E-commerce
- crm.svg → CRM for Agencies
- project-management.svg → Project Management for Startups
- seo-tools.svg → SEO Tools for Bloggers
- social-media.svg → Social Media Schedulers
- video-editing.svg → Video Editing for YouTubers
- analytics.svg → Analytics Tools for Mobile Apps
- accounting.svg → Accounting Software for Freelancers
- ai-tools.svg → AI Tools for Realtors
- ai-writing.svg → AI Writing Tools for Authors
- vpn.svg → VPN Services for Remote Workers
- web-hosting.svg → Web Hosting for Small Business
- password-managers.svg → Password Managers for Teams
- chatbot.svg → Chatbot Platforms for SaaS
- email-verification.svg → Email Verification Tools
- og-image.svg → Homepage default

## Recommended Image Specs
- Size: 1200x630 pixels
- Format: PNG (best) or JPG
- File size: < 1MB
- Text: Category name + tagline
- Include: "Tools Reviews Hub" branding
