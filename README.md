# Plyaz - Sports Scouting Platform

A community-driven sports scouting platform MVP built with Next.js 15.4, enabling fans to discover, validate, and invest in athletes through sophisticated UI design and motion animations.

## UI Design System

### Design Philosophy
Plyaz employs a **monochrome minimalist** design approach that emphasizes clarity, sophistication, and premium user experience through careful use of shadows, motion, and typography.

### Color Palette
```css
/* Primary Monochrome Scale */
--black: #000000
--white: #FFFFFF
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
```

### Typography
- **Font Family**: DM Sans
- **Weight Mappings**: Custom weight system optimized for readability
- **Hierarchy**: Clear typographic scale for content organization

### Signature Design Elements

#### Plyaz Shadows
Custom shadow system for depth and premium feel:
```css
.shadow-plyaz-sm  /* Subtle elevation */
.shadow-plyaz-md  /* Standard cards */
.shadow-plyaz-lg  /* Modal dialogs */
.shadow-plyaz-xl  /* Hero elements */
```

#### Motion Design
- **Library**: Framer Motion with custom animation variants
- **Performance**: 60fps optimized animations
- **Patterns**: Defined in `src/lib/animations.ts`
- **Micro-interactions**: Hover states, page transitions, loading states

## Component Architecture

### UI Component Structure
```
src/components/
├── ui/                    # Base design system components
│   ├── Button.tsx        # Primary action components
│   ├── Card.tsx          # Content containers
│   ├── Input.tsx         # Form inputs
│   └── Modal.tsx         # Overlay components
├── athlete/              # Athlete-specific UI
│   ├── AthleteCard.tsx   # Athlete showcase cards
│   ├── MarketData.tsx    # Investment visualization
│   └── PerformanceChart.tsx
├── forms/                # Form components
│   ├── SubmissionForm.tsx
│   └── FileUpload.tsx
├── layout/               # Navigation & layout
│   ├── Navigation.tsx    # Main navigation
│   └── Header.tsx
├── motion/               # Animation components
│   ├── PageTransition.tsx
│   └── ScrollAnimation.tsx
└── scout/                # Scout dashboard UI
    ├── Dashboard.tsx
    └── SubmissionQueue.tsx
```

### Design Tokens
Located in `src/lib/design-tokens.ts`:
- Spacing scale
- Border radius values
- Animation timing functions
- Z-index layers

## Key UI Features

### Athlete Cards
- Monochrome design with subtle shadows
- Market data visualization
- Investment tracking UI
- Performance metrics display

### Navigation System
- Clean, minimal navigation bar
- User authentication states
- Role-based navigation (scout/fan/athlete)
- Mobile-responsive design

### Form Design
- React Hook Form integration
- Zod validation with UI feedback
- File upload with drag & drop
- Draft saving functionality
- Progress indicators

### Modal & Overlay System
- Consistent overlay patterns
- Framer Motion animations
- Focus management
- Responsive behavior

### Dashboard Interfaces
- Scout dashboard with submission queue
- Athlete performance tracking
- Market simulation UI
- Voting mechanism interface

## Animation Guidelines

### Motion Principles
1. **Purposeful**: Every animation serves a functional purpose
2. **Subtle**: Enhances without overwhelming
3. **Consistent**: Unified timing and easing
4. **Performant**: 60fps target with GPU acceleration

### Animation Library Usage
```typescript
import { fadeIn, slideUp, scaleIn } from '@/lib/animations'

// Component with motion
<motion.div
  variants={fadeIn}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Content
</motion.div>
```

### Common Animation Patterns
- **Page Transitions**: Smooth route changes
- **Card Hover States**: Subtle elevation changes
- **Loading States**: Skeleton screens and spinners
- **Form Interactions**: Validation feedback animations

## Responsive Design

### Breakpoint System
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1440px

### Mobile-First Approach
- Progressive enhancement from mobile
- Touch-friendly interaction targets
- Optimized font sizes and spacing
- Simplified navigation patterns

## Accessibility Features

### Design Considerations
- High contrast monochrome palette
- Keyboard navigation support
- Screen reader optimizations
- Focus management
- ARIA labels and roles

### Interactive Elements
- Minimum 44px touch targets
- Clear focus indicators
- Semantic HTML structure
- Error message clarity

## Development Workflow

### Getting Started
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
npx tsc --noEmit     # Type checking
```

### Design System Usage
1. Import base UI components from `src/components/ui/`
2. Use design tokens from `src/lib/design-tokens.ts`
3. Apply Plyaz shadow classes for consistent elevation
4. Implement animations using predefined variants

### Styling Conventions
- Tailwind CSS with custom configuration
- Component-scoped styles when needed
- Consistent naming patterns
- Mobile-first responsive design

## Performance Optimization

### Animation Performance
- GPU-accelerated transforms
- `will-change` property usage
- Reduced motion preferences respect
- Lazy loading for complex animations

### Image Optimization
- Next.js Image component
- Responsive image loading
- WebP format support
- Lazy loading implementation

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Future Design Considerations
- Dark mode implementation potential
- Enhanced accessibility features
- Performance monitoring integration
- Advanced animation patterns

---

*For technical implementation details, see [CLAUDE.md](./CLAUDE.md)*
