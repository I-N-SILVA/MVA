# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plyaz is a sports scouting platform MVP built with Next.js 15.4, allowing fans to discover, validate, and invest in athletes through community-driven scouting. The platform features a monochrome design system with premium motion animations.

## Essential Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check without emitting files
```

### Environment Setup
- Copy `.env.example` to `.env.local`
- Required Supabase environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Architecture Overview

### Database & Authentication
- **Supabase**: Primary backend with PostgreSQL database
- **Auth System**: Supabase Auth with extended user profiles
- **Database Schema**: Defined in `supabase/migrations/` with comprehensive RLS policies
- **Types**: Auto-generated from Supabase schema in `src/types/supabase.ts`

### State Management
- **Zustand**: Primary state management (`src/stores/`)
- **Submission Store**: Persistent form state with draft saving functionality
- **Auth Hook**: Custom `useAuth` hook with profile integration

### Key Data Models
- **Athletes**: Core entity with market data, performance metrics, and investment tracking
- **Submissions**: Athlete nomination system with voting mechanism
- **Profiles**: Extended user data with reputation scores and user types (scout/fan/athlete)
- **Market Data**: Investment simulation with share prices and market caps

### UI Architecture
- **Design System**: Monochrome minimalism with black/white/gray palette
- **Motion**: Framer Motion with custom animation library (`src/lib/animations.ts`)
- **Components**: Modular structure in `src/components/` organized by domain
- **Styling**: Tailwind CSS with custom design tokens and Plyaz-specific shadows

### File Organization
```
src/
├── app/                    # Next.js 15 App Router pages
├── components/            # Reusable UI components
│   ├── athlete/          # Athlete-specific components
│   ├── auth/             # Authentication components  
│   ├── forms/            # Form components
│   ├── layout/           # Layout components (Navigation)
│   ├── motion/           # Animation components
│   ├── scout/            # Scout dashboard components
│   └── ui/               # Base UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── animations.ts     # Framer Motion animation library
│   ├── design-tokens.ts  # Design system tokens
│   ├── supabase/         # Supabase client configurations
│   ├── utils/            # General utilities
│   └── validations/      # Zod schemas
├── stores/               # Zustand stores
└── types/                # TypeScript type definitions
```

## Critical Implementation Details

### Authentication Pattern
The `useAuth` hook returns user data with embedded profile information, not a separate `profile` object. Components should destructure `{ user, isLoading }` and access profile data via `user.reputation_score`, `user.full_name`, etc.

### Supabase Client Pattern
- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts` 
- Middleware: `src/lib/supabase/middleware.ts`

### Design System Conventions
- Use `shadow-plyaz-*` classes for the signature box-shadow style
- Animations should use the predefined variants from `src/lib/animations.ts`
- Stick to the monochrome color palette defined in Tailwind config
- Font family is DM Sans with specific weight mappings

### Form Handling
- React Hook Form with Zod validation
- Submission forms use Zustand store for persistence
- File uploads handled through custom `FileUpload` component
- Draft saving functionality built into submission store

### Data Fetching Pattern
- Custom hooks in `src/hooks/` for data fetching
- Supabase client-side queries with TypeScript integration
- Real-time subscriptions for voting and market data updates

## Database Schema Notes
- RLS (Row Level Security) is extensively used
- User profiles extend `auth.users` with additional fields
- Athletes have complex market simulation data
- Submissions include voting mechanisms with time-based deadlines
- All tables use UUID primary keys and include audit timestamps

## Performance Considerations
- Next.js 15 with Turbopack for fast development builds
- Framer Motion animations are optimized for 60fps
- Image optimization through Next.js Image component
- Bundle analysis available through Next.js built-in tools

## Testing Strategy
Currently no test framework is configured. When adding tests, consider:
- Component testing for UI components
- Integration testing for Supabase interactions
- E2E testing for critical user flows like submission and voting