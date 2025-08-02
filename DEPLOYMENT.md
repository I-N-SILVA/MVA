# Deployment Guide for Plyaz MVP

**Last updated:** January 2025

## Vercel Deployment

### Prerequisites
- GitHub repository connected: `https://github.com/I-N-SILVA/MVA.git`
- Supabase project set up with the provided credentials

### Environment Variables Required

Add these environment variables in your Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tobgctazftbyunehbznr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYmdjdGF6ZnRieXVuZWhiem5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzc1NTEsImV4cCI6MjA2OTMxMzU1MX0.IIgJaF139YQW_DQ0Ikf83TzQYx5Om-El-5rnQBJiCW0
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Plyaz
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
NEXT_PUBLIC_MAX_VIDEO_SIZE=104857600
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
NEXT_PUBLIC_ALLOWED_VIDEO_TYPES=video/mp4,video/quicktime,video/webm
```

### Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import the repository: `I-N-SILVA/MVA`

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add all the variables listed above

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

### Database Setup

Ensure your Supabase database has the required tables by running the migrations:

```bash
# Run these SQL files in your Supabase SQL editor:
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_add_comments_system.sql
```

### Build Configuration

The project is configured for:
- Next.js 15 with Turbopack (dev mode)
- Node.js 18+ required
- TypeScript compilation
- Tailwind CSS processing
- Framer Motion animations

### Domain Configuration

After deployment, update:
- `NEXT_PUBLIC_APP_URL` to your actual domain
- Supabase Auth settings to include your domain in allowed origins