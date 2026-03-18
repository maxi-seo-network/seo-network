#!/usr/bin/env node
/**
 * Fix minimal index.html files that are missing SEO elements
 * These files don't have proper OG tags at all
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.toolreviewshub.com';

const categoryData = {
  'analytics-tools-apps': {
    title: 'Best Analytics Tools for Mobile Apps in 2026 | App Analytics Comparison',
    description: 'Compare top mobile app analytics tools. Features, pricing, and integrations for Firebase, Amplitude, Mixpanel, and more. Expert reviews for app developers.',
    image: 'analytics-apps.png'
  },
  'email-marketing-tools-ecommerce': {
    title: 'Best Email Marketing Tools for E-commerce in 2026 | Features & Pricing',
    description: 'Compare email marketing platforms for e-commerce. Klaviyo, Mailchimp, and more with features, pricing, and ROI analysis. Expert reviews.',
    image: 'email-marketing-ecommerce.png'
  },
  'social-media-schedulers-influencers': {
    title: 'Best Social Media Schedulers for Influencers in 2026 | Tools Comparison',
    description: 'Compare social media scheduling tools for influencers. Buffer, Hootsuite, Later features and pricing. Automate your content strategy.',
    image: 'social-media-schedulers.png'
  },
  'video-editing-software-youtubers': {
    title: 'Best Video Editing Software for YouTubers in 2026 | Editor Comparison',
    description: 'Compare video editing software for content creators. Adobe Premiere, DaVinci Resolve, Final Cut Pro features, pricing, and learning curves.',
    image: 'video-editing-youtubers.png'
  }
};

function addSEOToMinimalIndex(html, categorySlug) {
  const data = categoryData[categorySlug];
  if (!data) return html;
  
  // Check if it already has og:image (already processed)
  if (html.includes('property="og:image"')) {
    return html;
  }
  
  const seoTags = `
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${data.title.split('|')[0].trim()}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${BASE_URL}/${categorySlug}/">
  <meta property="og:site_name" content="Tools Reviews Hub">
  <meta property="og:image" content="${BASE_URL}/images/${data.image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title.split('|')[0].trim()}">
  <meta name="twitter:description" content="${data.description}">
  <link rel="canonical" href="${BASE_URL}/${categorySlug}/">
  <meta name="description" content="${data.description}">
`;

  // Insert after viewport meta
  if (html.includes('name="viewport"')) {
    return html.replace(
      /(<meta name="viewport"[^>]*>)/,
      `$1${seoTags}`
    );
  }
  
  // Insert after charset
  if (html.includes('charset=')) {
    return html.replace(
      /(<meta charset="[^"]*"[^>]*>)/i,
      `$1${seoTags}`
    );
  }
  
  return html;
}

// Process files
const seoNetworkDir = path.join(__dirname, '..');

for (const [category, data] of Object.entries(categoryData)) {
  const indexPath = path.join(seoNetworkDir, category, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`No index.html in ${category}`);
    continue;
  }
  
  let html = fs.readFileSync(indexPath, 'utf-8');
  const originalHtml = html;
  
  html = addSEOToMinimalIndex(html, category);
  
  if (html !== originalHtml) {
    fs.writeFileSync(indexPath, html);
    console.log(`✓ Added SEO to ${category}/index.html`);
  } else {
    console.log(`  No changes needed for ${category}/index.html`);
  }
}

console.log('\nDone!');