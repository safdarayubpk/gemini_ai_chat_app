# 🚀 Deployment Guide - Vercel

## ✅ Pre-Deployment Checklist

All critical issues have been **FIXED**:

- ✅ API key moved to headers (security fix)
- ✅ Environment variable template created
- ✅ Health check endpoint added
- ✅ Security headers configured
- ✅ Vercel configuration file created
- ✅ Build tested and passing

---

## 📋 Deployment Steps

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended for first deploy)

1. Go to [https://vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure project:

   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**

   - Go to "Environment Variables" section
   - Add: `GEMINI_API_KEY` = `your_actual_api_key`
   - Apply to: Production, Preview, Development

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? gemini-ai-chat (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add GEMINI_API_KEY
# Enter your API key when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

---

## 🔧 Environment Variables

You need to set these in Vercel:

| Variable         | Value               | Where to Get                           |
| ---------------- | ------------------- | -------------------------------------- |
| `GEMINI_API_KEY` | Your Gemini API key | https://aistudio.google.com/app/apikey |

### How to Add in Vercel Dashboard:

1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add `GEMINI_API_KEY`
4. Paste your API key
5. Select environments: Production ✅ Preview ✅ Development ✅
6. Click "Save"

---

## 🧪 Testing Deployment

### 1. Test Health Check

```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T...",
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Test Chat API

```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "assistant": "Hello! How can I help you today?"
}
```

### 3. Test in Browser

1. Open `https://your-app.vercel.app`
2. Type a message
3. Verify response appears

---

## 🔒 Security Configuration

### Security Headers (Already Configured)

The `vercel.json` file includes:

- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`

### API Key Security

- ✅ API key in request headers (not URL)
- ✅ API key in environment variables
- ✅ .env files gitignored

---

## 📊 Monitoring

### Vercel Analytics (Built-in)

1. Go to your project in Vercel
2. Click "Analytics" tab
3. View:
   - Page views
   - Response times
   - Error rates

### Logs

View real-time logs:

```bash
vercel logs
# or
vercel logs --follow
```

In Vercel Dashboard:

1. Go to project
2. Click deployment
3. View "Runtime Logs"

---

## 🚨 Troubleshooting

### Issue: Deployment Fails

**Check:**

```bash
# Test build locally
npm run build

# Check for errors
npm run lint
```

### Issue: API Returns 500 Error

**Check:**

1. Environment variable is set: `GEMINI_API_KEY`
2. API key is valid
3. Check Vercel logs:
   ```bash
   vercel logs --follow
   ```

### Issue: API Key Not Working

**Verify:**

1. Go to https://aistudio.google.com/app/apikey
2. Check if key is active
3. Generate new key if needed
4. Update in Vercel:
   - Settings → Environment Variables
   - Edit `GEMINI_API_KEY`
   - Redeploy

### Issue: CORS Errors

**Note:** CORS is not restricted by default. If needed, add middleware for specific domains.

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your Git repository:

- **Main/Master branch** → Production
- **Other branches** → Preview deployments

### Disable Auto-Deploy (if needed)

1. Go to Project Settings
2. Git → Ignored Build Step
3. Add condition

---

## 📈 Performance Optimization

### Already Implemented:

- ✅ Static page generation
- ✅ Automatic code splitting
- ✅ Image optimization (if using next/image)
- ✅ Turbopack for faster builds

### Optional Improvements:

1. **Add Caching:**

   ```typescript
   // In API routes
   export const revalidate = 3600; // Cache for 1 hour
   ```

2. **Add Edge Runtime:**

   ```typescript
   export const runtime = "edge";
   ```

3. **Optimize Images:**
   ```tsx
   import Image from "next/image";
   <Image src="..." width={500} height={300} />;
   ```

---

## 🎯 Post-Deployment Checklist

After deploying, verify:

- [ ] Health check responds: `/api/health`
- [ ] Chat API works: `/api/chat`
- [ ] Streaming works: `/api/chat-stream`
- [ ] UI loads correctly
- [ ] Environment variables are set
- [ ] No console errors in browser
- [ ] Mobile responsiveness
- [ ] Analytics is tracking (if enabled)

---

## 🔗 Useful Commands

```bash
# View deployments
vercel ls

# View logs
vercel logs

# Open project in browser
vercel open

# View environment variables
vercel env ls

# Remove a deployment
vercel remove [deployment-url]

# Link local project to Vercel project
vercel link
```

---

## 📱 Custom Domain (Optional)

### Add Custom Domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   - **A Record:** `76.76.21.21`
   - **CNAME:** `cname.vercel-dns.com`
4. Wait for DNS propagation (5-30 minutes)
5. SSL certificate auto-generated

---

## 🎉 Deployment Complete!

Your app is now live at:

```
https://your-app.vercel.app
```

### Next Steps:

1. ✅ Test all features
2. ✅ Monitor logs for errors
3. ✅ Set up analytics (optional)
4. ✅ Add custom domain (optional)
5. ✅ Share with users!

---

## 📞 Support

### Vercel Documentation:

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deployment](https://vercel.com/docs/deployments/overview)

### Project Documentation:

- `PRE_DEPLOYMENT_AUDIT.md` - Security audit
- `README.md` - Project overview
- `STREAMING_GUIDE.md` - Streaming implementation

### Vercel Support:

- https://vercel.com/support
- https://github.com/vercel/vercel/discussions

---

**🚀 Your Gemini AI Chat is ready for production!**
