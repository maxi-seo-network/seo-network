#!/usr/bin/env python3
"""
Add breadcrumb schema to all HTML files that don't have it.
Category pages: Home > Category
Article pages: Home > Category > Article
"""

import os
import re
import html
from pathlib import Path

# Category name mappings (directory slug -> display name)
CATEGORY_NAMES = {
    "email-marketing-tools-ecommerce": "Email Marketing",
    "best-crm-for-agencies": "CRM for Agencies",
    "project-management-software-startups": "Project Management",
    "seo-tools-bloggers": "SEO Tools",
    "social-media-schedulers-influencers": "Social Media Schedulers",
    "video-editing-software-youtubers": "Video Editing Software",
    "analytics-tools-apps": "Analytics Tools",
    "accounting-software-freelancers": "Accounting Software",
    "ai-tools-for-realtors": "AI Tools for Realtors",
    "ai-writing-tools-authors": "AI Writing Tools",
    "chatbot-platforms-saas": "Chatbot Platforms",
    "vpn-services-remote-workers": "VPN Services",
    "password-managers-teams": "Password Managers",
    "web-hosting-small-business": "Web Hosting",
    "email-verification-tools": "Email Verification Tools",
    "trading": "Trading",
}

BASE_URL = "https://www.toolreviewshub.com"


def get_page_title(content: str) -> str:
    """Extract page title from HTML content."""
    # Try to get title from <title> tag
    match = re.search(r"<title>([^<]+)</title>", content, re.IGNORECASE)
    if match:
        title = match.group(1)
        # Clean up title - remove year, brand name, etc.
        title = re.sub(r"\s*\|\s*Tools Reviews Hub.*$", "", title)
        title = re.sub(r"\s*-\s*Tools Reviews Hub.*$", "", title)
        title = re.sub(r"\s*2026.*$", "", title)
        title = re.sub(r"\s*Complete Guide.*$", "", title)
        title = re.sub(r"\s*Comparison.*$", "", title)
        title = re.sub(r"^Best\s+", "", title)
        title = re.sub(r"\s*Reviews.*$", "", title)
        title = title.strip()
        return title
    return "Article"


def create_category_breadcrumb(category_name: str, category_url: str) -> str:
    """Create breadcrumb schema for category pages (2 items)."""
    return f'''  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "{BASE_URL}/"
      }},
      {{
        "@type": "ListItem",
        "position": 2,
        "name": "{category_name}",
        "item": "{category_url}"
      }}
    ]
  }}
  </script>'''


def create_article_breadcrumb(category_name: str, category_url: str, article_name: str, article_url: str) -> str:
    """Create breadcrumb schema for article pages (3 items)."""
    # Escape quotes in names
    article_name_escaped = article_name.replace('"', '\\"')
    return f'''  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "{BASE_URL}/"
      }},
      {{
        "@type": "ListItem",
        "position": 2,
        "name": "{category_name}",
        "item": "{category_url}"
      }},
      {{
        "@type": "ListItem",
        "position": 3,
        "name": "{article_name_escaped}",
        "item": "{article_url}"
      }}
    ]
  }}
  </script>'''


def find_last_schema_position(content: str) -> int:
    """Find the position after the last schema.org script block in the head."""
    # Find all schema blocks and get position after the last one
    last_end = 0
    
    # Pattern to match schema script blocks
    pattern = r'<script\s+type="application/ld\+json"[^>]*>.*?</script>'
    
    for match in re.finditer(pattern, content, re.DOTALL | re.IGNORECASE):
        last_end = match.end()
    
    return last_end


def add_breadcrumb_to_file(filepath: Path, category_slug: str) -> tuple[bool, str]:
    """
    Add breadcrumb schema to a file.
    Returns (success, message).
    """
    try:
        content = filepath.read_text(encoding='utf-8')
        
        # Check if already has BreadcrumbList
        if 'BreadcrumbList' in content:
            return False, "Already has BreadcrumbList"
        
        category_name = CATEGORY_NAMES.get(category_slug, category_slug.title())
        category_url = f"{BASE_URL}/{category_slug}/"
        filename = filepath.name
        
        if filename == "index.html":
            # Category page
            breadcrumb = create_category_breadcrumb(category_name, category_url)
        else:
            # Article page
            article_title = get_page_title(content)
            article_url = f"{BASE_URL}/{category_slug}/{filename}"
            breadcrumb = create_article_breadcrumb(category_name, category_url, article_title, article_url)
        
        # Find insertion point - after the last schema block
        insert_pos = find_last_schema_position(content)
        
        if insert_pos == 0:
            # No schema found, insert before </head>
            insert_pos = content.lower().find('</head>')
            if insert_pos == -1:
                return False, "No </head> tag found"
        else:
            # Insert right after the last schema block
            pass
        
        # Insert the breadcrumb
        # Add a newline before the breadcrumb if there isn't one
        before = content[:insert_pos].rstrip()
        after = content[insert_pos:]
        
        # Ensure proper spacing
        new_content = before + "\n\n" + breadcrumb + "\n" + after
        
        # Write the file
        filepath.write_text(new_content, encoding='utf-8')
        
        return True, f"Added breadcrumb for '{article_title if filename != 'index.html' else category_name}'"
    
    except Exception as e:
        return False, f"Error: {str(e)}"


def main():
    base_path = Path("/home/node/.openclaw/workspace/seo-network")
    
    stats = {
        "total_files": 0,
        "already_has_breadcrumb": 0,
        "added": 0,
        "errors": 0,
        "skipped": 0,
    }
    
    # Process each category directory
    for category_slug, category_name in CATEGORY_NAMES.items():
        category_dir = base_path / category_slug
        
        if not category_dir.exists():
            print(f"Skipping non-existent directory: {category_slug}")
            continue
        
        print(f"\nProcessing: {category_name} ({category_slug})")
        print("-" * 50)
        
        # Process all HTML files in this directory
        for html_file in sorted(category_dir.glob("*.html")):
            stats["total_files"] += 1
            
            success, message = add_breadcrumb_to_file(html_file, category_slug)
            
            if "Already has BreadcrumbList" in message:
                stats["already_has_breadcrumb"] += 1
            elif success:
                stats["added"] += 1
                print(f"  ✓ {html_file.name}: {message}")
            else:
                stats["errors"] += 1
                print(f"  ✗ {html_file.name}: {message}")
    
    # Also process root HTML files
    print("\n\nProcessing root HTML files...")
    print("-" * 50)
    
    for html_file in sorted(base_path.glob("*.html")):
        filename = html_file.name
        stats["total_files"] += 1
        
        # Read and check
        content = html_file.read_text(encoding='utf-8')
        
        if 'BreadcrumbList' in content:
            stats["already_has_breadcrumb"] += 1
            continue
        
        # Root files don't have category breadcrumbs (they're top-level)
        # Only about.html, contact.html, etc. - these shouldn't need category breadcrumbs
        # But we might want to add a simple Home breadcrumb
        
        # For now, skip root files
        stats["skipped"] += 1
        print(f"  Skipped: {filename} (root file)")
    
    # Print summary
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Total HTML files scanned: {stats['total_files']}")
    print(f"Already had BreadcrumbList: {stats['already_has_breadcrumb']}")
    print(f"Breadcrumbs added: {stats['added']}")
    print(f"Errors: {stats['errors']}")
    print(f"Skipped: {stats['skipped']}")


if __name__ == "__main__":
    main()