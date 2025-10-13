#!/bin/bash

echo "🧪 Theme Toggle Test Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAIL++))
    fi
}

echo "1️⃣  Checking if Next.js dev server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    test_result 0 "Dev server is running on localhost:3000"
else
    test_result 1 "Dev server is NOT running. Run 'npm run dev' first!"
    echo ""
    echo "To run the dev server:"
    echo "  cd $(pwd)"
    echo "  npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Checking if next-themes is installed..."
if grep -q "next-themes" package.json; then
    test_result 0 "next-themes package is in package.json"
else
    test_result 1 "next-themes is NOT in package.json"
fi

echo ""
echo "3️⃣  Checking ThemeContext implementation..."
if grep -q "next-themes" contexts/ThemeContext.tsx; then
    test_result 0 "ThemeContext uses next-themes"
else
    test_result 1 "ThemeContext doesn't use next-themes"
fi

echo ""
echo "4️⃣  Checking for hardcoded theme in layout..."
if grep -q 'className="dark"' app/layout.tsx; then
    test_result 1 "Found hardcoded className='dark' in layout (this blocks theme toggle!)"
else
    test_result 0 "No hardcoded theme class in layout"
fi

echo ""
echo "5️⃣  Checking for mounted state in Header..."
if grep -q "mounted" components/Header.tsx; then
    test_result 0 "Header has mounted state (prevents hydration error)"
else
    test_result 1 "Header missing mounted state"
fi

echo ""
echo "6️⃣  Checking for suppressHydrationWarning in layout..."
if grep -q "suppressHydrationWarning" app/layout.tsx; then
    test_result 0 "Layout has suppressHydrationWarning prop"
else
    test_result 1 "Layout missing suppressHydrationWarning prop"
fi

echo ""
echo "7️⃣  Testing HTML page access..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$RESPONSE" = "200" ]; then
    test_result 0 "Home page returns 200 OK"
else
    test_result 1 "Home page returns $RESPONSE"
fi

echo ""
echo "8️⃣  Checking build status..."
if npm run build > /dev/null 2>&1; then
    test_result 0 "Project builds without errors"
else
    test_result 1 "Project has build errors"
fi

echo ""
echo "============================"
echo "📊 Test Summary"
echo "============================"
echo -e "Passed: ${GREEN}${PASS}${NC}"
echo -e "Failed: ${RED}${FAIL}${NC}"
echo ""

TOTAL=$((PASS + FAIL))

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All automated tests passed!${NC}"
    echo ""
    echo "📝 Manual verification needed:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Open DevTools (F12) and check Console tab"
    echo "3. Click the sun/moon icon (top right)"
    echo "4. Verify:"
    echo "   ✅ Background changes from dark to light (or vice versa)"
    echo "   ✅ No console errors appear"
    echo "   ✅ Theme persists after page refresh"
    echo ""
    echo "If all manual checks pass, your theme toggle is fully functional! ✨"
    exit 0
else
    echo -e "${RED}⚠️  $FAIL test(s) failed${NC}"
    echo ""
    echo "Please fix the failed tests above."
    exit 1
fi

