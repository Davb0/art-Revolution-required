#!/bin/bash

# Art Revolution - Screenshot Management Script
# This script helps you organize screenshots for the README

DOCS_DIR="./docs/images"
echo "🎨 Art Revolution - Screenshot Manager"
echo "======================================"
echo ""

# Check if docs/images directory exists
if [ ! -d "$DOCS_DIR" ]; then
    echo "❌ Creating docs/images directory..."
    mkdir -p "$DOCS_DIR"
else
    echo "✅ docs/images directory exists"
fi

echo ""
echo "📸 Required Screenshots:"
echo "======================="

# List of required screenshots
screenshots=(
    "homepage-hero-1.png:Main landing page with hero section (version 1)"
    "homepage-hero-2.png:Main landing page with hero section (version 2)" 
    "homepage-hero-3.png:Main landing page with hero section (version 3)"
    "events-grid.png:Events grid showing cultural events"
    "submission-form.png:Event submission modal form" 
    "filter-panel.png:Advanced filtering options"
    "about-page.png:About page showing mission"
    "partners-page.png:Partners and collaborations"
    "newsletter-page.png:Newsletter subscription"
    "contact-page.png:Contact form and information"
    "platform-stats.png:Real-time platform statistics"
)

# Check which screenshots are missing
missing_count=0
for item in "${screenshots[@]}"; do
    filename=$(echo $item | cut -d: -f1)
    description=$(echo $item | cut -d: -f2)
    
    if [ -f "$DOCS_DIR/$filename" ]; then
        echo "✅ $filename - $description"
    else
        echo "❌ $filename - $description"
        ((missing_count++))
    fi
done

echo ""
if [ $missing_count -eq 0 ]; then
    echo "🎉 All screenshots are present!"
else
    echo "📝 Missing $missing_count screenshots"
    echo ""
    echo "Instructions:"
    echo "1. Start your server: npm start"
    echo "2. Open http://localhost:3000 in browser"
    echo "3. Take screenshots of each section"
    echo "4. Save them in ./docs/images/ with exact filenames above"
    echo "5. Run this script again to verify"
fi

echo ""
echo "📂 Screenshot folder: $DOCS_DIR"
echo "📋 Total screenshots needed: ${#screenshots[@]}"