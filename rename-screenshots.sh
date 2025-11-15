#!/bin/bash

# Art Revolution - Screenshot Renamer Helper
# This script helps you organize your existing homepage screenshots

DOCS_DIR="./docs/images"
echo "🎨 Art Revolution - Screenshot Renamer"
echo "====================================="
echo ""

# Check if docs/images directory exists
if [ ! -d "$DOCS_DIR" ]; then
    echo "❌ docs/images directory not found!"
    exit 1
fi

echo "📸 Homepage Screenshot Organization:"
echo "==================================="
echo ""
echo "If you have homepage screenshots to organize, use these commands:"
echo ""
echo "# Rename your existing screenshots:"
echo "mv ./docs/images/homepage1.png ./docs/images/homepage-hero-1.png"
echo "mv ./docs/images/homepage2.png ./docs/images/homepage-hero-2.png"  
echo "mv ./docs/images/homepage3.png ./docs/images/homepage-hero-3.png"
echo ""
echo "# Or if they have different names:"
echo "mv ./docs/images/your-screenshot-name-1.png ./docs/images/homepage-hero-1.png"
echo "mv ./docs/images/your-screenshot-name-2.png ./docs/images/homepage-hero-2.png"
echo "mv ./docs/images/your-screenshot-name-3.png ./docs/images/homepage-hero-3.png"
echo ""

# List current files in docs/images
echo "📂 Current files in docs/images:"
if [ "$(ls -A $DOCS_DIR)" ]; then
    ls -la $DOCS_DIR/ | grep -v "^total" | grep -v "^\.$" | grep -v "^\.\.$"
else
    echo "   (empty - no files yet)"
fi

echo ""
echo "💡 Tips:"
echo "  - Screenshot names should be exactly: homepage-hero-1.png, homepage-hero-2.png, homepage-hero-3.png"
echo "  - Use PNG format for best quality"
echo "  - Recommended size: 1920x1080 or similar high resolution"
echo ""
echo "🔍 Run ./check-screenshots.sh after renaming to verify all files"