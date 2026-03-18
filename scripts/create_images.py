#!/usr/bin/env python3
"""Generate PNG images for og:image from SVG templates"""
import os
from PIL import Image, ImageDraw, ImageFont

# Category configurations
CATEGORIES = [
    ("email-marketing", "📧 Email Marketing", "for E-commerce", "#667eea", "#764ba2"),
    ("crm", "📊 CRM for Agencies", "Compare Top Tools", "#f093fb", "#f5576c"),
    ("project-management", "📋 Project Management", "for Startups", "#4facfe", "#00f2fe"),
    ("seo-tools", "🔍 SEO Tools", "for Bloggers", "#43e97b", "#38f9d7"),
    ("social-media", "📱 Social Media", "Schedulers for Influencers", "#fa709a", "#fee140"),
    ("video-editing", "🎬 Video Editing", "for YouTubers", "#a18cd1", "#fbc2eb"),
    ("analytics", "📈 Analytics Tools", "for Mobile Apps", "#667eea", "#764ba2"),
    ("accounting", "💰 Accounting Software", "for Freelancers", "#00c6fb", "#005bea"),
    ("ai-tools", "🤖 AI Tools", "for Realtors", "#f857a6", "#ff5858"),
    ("ai-writing", "✍️ AI Writing Tools", "for Authors", "#4776E6", "#8E54E9"),
    ("vpn", "🔐 VPN Services", "for Remote Workers", "#0f0c29", "#302b63"),
    ("web-hosting", "🌐 Web Hosting", "for Small Business", "#11998e", "#38ef7d"),
    ("password-managers", "🔑 Password Managers", "for Teams", "#ee0979", "#ff6a00"),
    ("chatbot", "💬 Chatbot Platforms", "for SaaS", "#00d2ff", "#3a7bd5"),
    ("email-verification", "✉️ Email Verification", "Tools", "#56ab2f", "#a8e063"),
    ("og-image", "Tools Reviews Hub", "Expert Software Reviews", "#667eea", "#764ba2"),
]

def create_image(name, title, subtitle, color1, color2, width=1200, height=630):
    """Create a gradient image with text"""
    try:
        # Create gradient
        img = Image.new('RGB', (width, height))
        draw = ImageDraw.Draw(img)
        
        # Draw gradient
        for y in range(height):
            ratio = y / height
            r = int(int(color1[1:3], 16) * (1 - ratio) + int(color2[1:3], 16) * ratio)
            g = int(int(color1[3:5], 16) * (1 - ratio) + int(color2[3:5], 16) * ratio)
            b = int(int(color1[5:7], 16) * (1 - ratio) + int(color2[5:7], 16) * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        
        # Try to use a default font, fallback to default if not available
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 56)
            font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Draw text
        draw.text((width//2, height//3), title, fill='white', font=font_large, anchor='mm')
        draw.text((width//2, height//2), subtitle, fill='white', font=font_medium, anchor='mm')
        draw.text((width//2, height*4//5), 'Tools Reviews Hub', fill='white', font=font_small, anchor='mm')
        
        return img
    except Exception as e:
        print(f"Error creating {name}: {e}")
        return None

if __name__ == "__main__":
    os.makedirs("images", exist_ok=True)
    
    for name, title, subtitle, c1, c2 in CATEGORIES:
        img = create_image(name, title, subtitle, c1, c2)
        if img:
            filepath = f"images/{name}.png"
            img.save(filepath, "PNG")
            print(f"Created {filepath}")
    
    print("\nAll images created!")