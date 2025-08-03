# Vercel Environment Variables Setup

## 🚀 Authentication Fix Complete - Environment Variables Required

The authentication system has been completely rebuilt with:
- ✅ Password reset functionality
- ✅ Email confirmation flow
- ✅ Resend confirmation emails
- ✅ Proper error handling
- ✅ Fixed profile creation

## **CRITICAL: Set These Environment Variables**

### **Step 1: Access Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (plyaz-mvp)
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add/Update These Variables**

#### **Production Domain (CRITICAL)**
```bash
NEXT_PUBLIC_APP_URL=https://mva-chi.vercel.app
```
✅ **Updated with your actual Vercel domain**

#### **Supabase Configuration**
```bash
# Already configured - verify these are set
NEXT_PUBLIC_SUPABASE_URL=https://tobgctazftbyunehbznr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYmdjdGF6ZnRieXVuZWhiem5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzc1NTEsImV4cCI6MjA2OTMxMzU1MX0.IIgJaF139YQW_DQ0Ikf83TzQYx5Om-El-5rnQBJiCW0

# ✅ Service role key configured
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYmdjdGF6ZnRieXVuZWhiem5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzU1MSwiZXhwIjoyMDY5MzEzNTUxfQ.R-43__IDxb8tXM8TQdVNXqOxPsVk-Od70yM4w6XRSQ4
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
4. Set **Site URL** to: `https://mva-chi.vercel.app`

### **Step 2: Update Redirect URLs**
In **Authentication** → **URL Configuration**, add these redirect URLs:
```
https://mva-chi.vercel.app/auth/callback
https://mva-chi.vercel.app/auth/reset-password
```

### **Step 3: Email Templates**
1. Go to **Authentication** → **Email Templates**
2. **Confirm Signup Template** - make sure redirect URL is: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
3. **Reset Password Template** - make sure redirect URL is: `{{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery`
4. Use `{{ .SiteURL }}` for all dynamic URLs (never hardcode localhost)

## ✅ Verification Steps

After setup:
1. ✅ Environment variables are set in Vercel (especially `NEXT_PUBLIC_APP_URL`)
2. ✅ Supabase Site URL is updated to production domain
3. ✅ Supabase redirect URLs include `/auth/callback` and `/auth/reset-password`
4. ✅ Get real `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard
5. ✅ Run the database migration: `003_fix_profile_creation.sql`
6. ✅ App is redeployed
7. ✅ Test complete authentication flow

## 🎯 What's Fixed

- ✅ **Password Reset**: Complete forgot password → email → reset flow
- ✅ **Email Confirmation**: Proper confirmation with resend functionality  
- ✅ **Profile Creation**: Fixed database trigger for user signup
- ✅ **Error Handling**: Comprehensive error pages and messages
- ✅ **Production URLs**: Proper URL handling across environments
- ✅ **User Experience**: Clear messaging and intuitive flows

## 🧪 Test These Flows

1. **Sign Up**: Create account → receive confirmation email → click link → redirect to dashboard
2. **Email Confirmation**: Test resend confirmation functionality
3. **Password Reset**: Request reset → receive email → click link → create new password → login
4. **Login**: Standard email/password login
5. **Google OAuth**: Social login flow
6. **Error Handling**: Invalid links, expired tokens, network errors

## 🚨 Common Issues

- **"localhost" in production emails**: Update `NEXT_PUBLIC_APP_URL` in Vercel
- **Profile not created**: Run migration `003_fix_profile_creation.sql`
- **Emails not sending**: Set correct `SUPABASE_SERVICE_ROLE_KEY`
- **Redirect errors**: Verify Supabase redirect URLs include your domain