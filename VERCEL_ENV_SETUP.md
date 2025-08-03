# Vercel Environment Variables Setup

## 🚀 Required Environment Variables for Production

To fix the email confirmation redirect issue, you need to set these environment variables in your Vercel dashboard:

### **Step 1: Access Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (MVA/plyaz-mvp)
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add/Update These Variables**

#### **Production Domain (CRITICAL)**
```bash
NEXT_PUBLIC_APP_URL=https://mva-chi.vercel.app/auth/signup
```
⚠️ **Replace with your actual Vercel domain!**

#### **Supabase Configuration**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tobgctazftbyunehbznr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYmdjdGF6ZnRieXVuZWhiem5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzc1NTEsImV4cCI6MjA2OTMxMzU1MX0.IIgJaF139YQW_DQ0Ikf83TzQYx5Om-El-5rnQBJiCW0
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

#### **App Configuration**
```bash
NEXT_PUBLIC_APP_NAME=Plyaz
NODE_ENV=production
```

#### **File Upload Configuration**
```bash
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
NEXT_PUBLIC_MAX_VIDEO_SIZE=104857600
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
NEXT_PUBLIC_ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/webm
```

### **Step 3: Set Environment Scope**
For each variable, set the environment to:
- ✅ **Production**
- ✅ **Preview** (optional)
- ❌ **Development** (use local .env.local)

### **Step 4: Redeploy**
After adding the variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

## 🔧 Supabase Dashboard Configuration

### **Step 1: Update Site URL**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to: `https://your-actual-vercel-domain.vercel.app`

### **Step 2: Update Redirect URLs**
In **Authentication** → **URL Configuration**, add:
- **Redirect URLs**: `https://your-actual-vercel-domain.vercel.app/auth/callback`

### **Step 3: Email Templates (If Needed)**
1. Go to **Authentication** → **Email Templates**
2. Update any hardcoded localhost URLs in templates
3. Use `{{ .SiteURL }}` for dynamic URLs

## ✅ Verification Steps

After setup:
1. ✅ Environment variables are set in Vercel
2. ✅ Supabase Site URL is updated
3. ✅ App is redeployed
4. ✅ Test email confirmation flow

## 🎯 Expected Result

- ✅ Email confirmations redirect to production domain
- ✅ No more localhost redirects
- ✅ Seamless authentication flow
- ✅ Proper domain handling across all environments