#!/bin/bash

# 🔍 Pre-Deployment Verification Script
# Runs all checks before deploying to production

echo "🔍 Pre-Deployment Verification"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# Test function
test_check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAIL++))
    fi
}

test_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

echo "🔒 SECURITY CHECKS"
echo "-------------------"

# Check 1: API key not in URL
echo -n "Checking API key security... "
if grep -r "generateContent?key=" app/api/ > /dev/null 2>&1; then
    test_check 1 "API key found in URL (CRITICAL)"
else
    test_check 0 "API key in headers (secure)"
fi

# Check 2: Middleware exists
echo -n "Checking middleware... "
if [ -f "middleware.ts" ]; then
    test_check 0 "Middleware file exists"
else
    test_check 1 "Middleware file missing"
fi

# Check 3: Rate limiting
echo -n "Checking rate limiting... "
if grep -q "rateLimit" middleware.ts; then
    test_check 0 "Rate limiting implemented"
else
    test_check 1 "Rate limiting not found"
fi

# Check 4: Security headers
echo -n "Checking security headers... "
if grep -q "X-Frame-Options" middleware.ts; then
    test_check 0 "Security headers configured"
else
    test_check 1 "Security headers missing"
fi

# Check 5: .gitignore for .env
echo -n "Checking .env gitignore... "
if grep -q ".env" .gitignore; then
    test_check 0 ".env files gitignored"
else
    test_check 1 ".env not in .gitignore"
fi

echo ""
echo "🏗️  BUILD CHECKS"
echo "-------------------"

# Check 6: TypeScript compilation
echo -n "Running TypeScript check... "
if npx tsc --noEmit > /dev/null 2>&1; then
    test_check 0 "TypeScript compiles without errors"
else
    test_check 1 "TypeScript errors found"
fi

# Check 7: Build success
echo -n "Running production build... "
if npm run build > /dev/null 2>&1; then
    test_check 0 "Production build successful"
else
    test_check 1 "Production build failed"
fi

# Check 8: ESLint
echo -n "Running ESLint... "
if npm run lint > /dev/null 2>&1; then
    test_check 0 "No linting errors"
else
    test_warn "Linting warnings found (non-blocking)"
fi

echo ""
echo "📁 CONFIGURATION CHECKS"
echo "-------------------"

# Check 9: Environment variable template
echo -n "Checking env template... "
if [ -f "env.example" ]; then
    test_check 0 "env.example exists"
else
    test_check 1 "env.example missing"
fi

# Check 10: Vercel config
echo -n "Checking vercel.json... "
if [ -f "vercel.json" ]; then
    test_check 0 "vercel.json exists"
else
    test_warn "vercel.json missing (optional)"
fi

# Check 11: Health check endpoint
echo -n "Checking health endpoint... "
if [ -f "app/api/health/route.ts" ]; then
    test_check 0 "Health check endpoint exists"
else
    test_check 1 "Health check missing"
fi

echo ""
echo "📦 API ROUTE CHECKS"
echo "-------------------"

# Check 12: Chat API
echo -n "Checking /api/chat... "
if [ -f "app/api/chat/route.ts" ]; then
    test_check 0 "Chat API exists"
else
    test_check 1 "Chat API missing"
fi

# Check 13: Streaming API
echo -n "Checking /api/chat-stream... "
if [ -f "app/api/chat-stream/route.ts" ]; then
    test_check 0 "Streaming API exists"
else
    test_check 1 "Streaming API missing"
fi

# Check 14: Error handling in APIs
echo -n "Checking API error handling... "
if grep -q "try" app/api/chat/route.ts && grep -q "catch" app/api/chat/route.ts; then
    test_check 0 "Error handling present"
else
    test_check 1 "Error handling missing"
fi

echo ""
echo "🎨 UI/UX CHECKS"
echo "-------------------"

# Check 15: Main page
echo -n "Checking main page... "
if [ -f "app/page.tsx" ]; then
    test_check 0 "Main page exists"
else
    test_check 1 "Main page missing"
fi

# Check 16: Error pages
echo -n "Checking error pages... "
if [ -f "app/error.tsx" ] && [ -f "app/global-error.tsx" ]; then
    test_check 0 "Error pages exist"
else
    test_check 1 "Error pages missing"
fi

# Check 17: Layout
echo -n "Checking root layout... "
if [ -f "app/layout.tsx" ]; then
    test_check 0 "Root layout exists"
else
    test_check 1 "Root layout missing"
fi

echo ""
echo "=============================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================="
echo ""
echo -e "Passed:   ${GREEN}${PASS}${NC}"
echo -e "Failed:   ${RED}${FAIL}${NC}"
echo -e "Warnings: ${YELLOW}${WARN}${NC}"
echo ""

TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! (${PERCENTAGE}%)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✅ Your project is READY FOR DEPLOYMENT!"
    echo ""
    echo "📝 Final Steps:"
    echo "1. Set GEMINI_API_KEY in Vercel"
    echo "2. Run: vercel --prod"
    echo "3. Test your deployment"
    echo ""
    echo "📚 Documentation:"
    echo "   - DEPLOY_NOW.md (quick reference)"
    echo "   - DEPLOYMENT_GUIDE.md (detailed steps)"
    echo "   - QA_REPORT.md (full audit report)"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  ${FAIL} CHECK(S) FAILED! (${PERCENTAGE}%)${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please fix the failed checks above before deploying."
    echo ""
    exit 1
fi

