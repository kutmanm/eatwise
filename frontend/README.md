# EatWise Frontend

## Overview
Modern React/Next.js frontend for the EatWise AI-powered nutrition tracking application.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand + SWR for server state
- **Charts**: Recharts
- **Authentication**: Supabase Auth
- **API Client**: Axios with JWT interceptors

## Features Implemented

### ✅ Authentication & Onboarding
- **Supabase Auth Integration**: Login, signup, password reset
- **3-Step Onboarding**: Basic info → Activity/goals → TDEE calculation
- **Protected Routes**: Authentication guards on all dashboard pages

### ✅ Core Dashboard
- **Daily Nutrition Summary**: Progress bars, calorie tracking
- **Meal Timeline**: Today's meals with quick actions
- **AI Daily Tips**: Personalized nutrition advice
- **Stats Overview**: Streak, meals, calories, water tracking

### ✅ Meal Management
- **Multi-Modal Logging**: Photo upload, text entry, manual input
- **AI Analysis**: Photo analysis with GPT-4 Vision
- **Rich History**: Search, filters, detailed meal views
- **CRUD Operations**: Create, edit, delete meals with validation

### ✅ Progress Visualization  
- **Interactive Charts**: Calorie trends, macro breakdown, goal progress
- **Multiple Timeframes**: 7-day, 30-day, 90-day analysis
- **Weight Tracking**: Trend visualization with goal indicators
- **Responsive Design**: Charts adapt to screen size

### ✅ AI Coaching System
- **Premium Chat**: Unlimited AI nutrition questions (Premium)
- **Instant Feedback**: Meal analysis and improvement suggestions
- **Smart Insights**: Nutrition scoring and quick analysis
- **Daily Tips**: Personalized recommendations

### ✅ Premium Features
- **Freemium Model**: Free (3 meals/day) vs Premium (unlimited)
- **Subscription Management**: Upgrade flow with Stripe integration
- **Feature Gating**: Premium-only AI chat, advanced analytics
- **Usage Limits**: Visual indicators and upgrade prompts

### ✅ Profile & Settings
- **Goal Management**: TDEE calculation, macro targets
- **Profile Editing**: Age, weight, activity level, goals
- **Account Settings**: Email, subscription, data export
- **Danger Zone**: Account deletion with confirmation

### ✅ Mobile Optimization
- **Responsive Design**: Mobile-first with touch-friendly targets
- **Camera Access**: Native camera integration for meal photos
- **Mobile Navigation**: Bottom tab bar for easy navigation
- **Touch Interactions**: Optimized for touch devices

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups
│   │   ├── auth/                 # Authentication pages
│   │   ├── dashboard/            # Main app pages
│   │   ├── onboarding/           # User setup flow
│   │   └── premium/              # Subscription management
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components
│   ├── auth/                     # Authentication components
│   ├── charts/                   # Data visualization
│   ├── dashboard/                # Dashboard widgets
│   ├── meal/                     # Meal management
│   ├── mobile/                   # Mobile-specific components
│   ├── premium/                  # Premium features
│   └── ui/                       # Base UI components
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication state
│   ├── useMeals.ts               # Meal data fetching
│   ├── useProgress.ts            # Progress analytics
│   ├── useUser.ts                # User profile management
│   └── useAI.ts                  # AI coaching interactions
├── lib/                          # Utilities and config
│   ├── api/                      # API client modules
│   ├── auth.ts                   # Supabase auth helpers
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Helper functions
└── types/                        # TypeScript definitions
    ├── api.ts                    # API response types
    ├── forms.ts                  # Form validation schemas
    └── index.ts                  # Type exports
```

## Key Components

### Data Fetching Strategy
- **SWR**: Automatic caching, revalidation, and error handling
- **API Client**: Centralized Axios instance with auth interceptors
- **Custom Hooks**: Domain-specific data fetching (`useMeals`, `useProgress`)

### Form Management
- **React Hook Form**: Performance-optimized forms with minimal re-renders
- **Zod Validation**: Type-safe schema validation
- **Error Handling**: Field-level validation with user-friendly messages

### State Management
- **Server State**: SWR for API data caching and synchronization
- **Client State**: React Context for authentication, local state for UI
- **Optimistic Updates**: Immediate UI feedback with automatic rollback

### Responsive Design
- **Mobile-First**: Designed for mobile with desktop enhancements
- **Touch Targets**: Minimum 44px touch targets for accessibility
- **Progressive Enhancement**: Core functionality works without JavaScript

## User Flows

### 1. Registration & Onboarding
```
Landing Page → Sign Up → Email Verification → 
Onboarding (3 steps) → Dashboard
```

### 2. Meal Logging
```
Dashboard → Add Meal → Choose Method (Photo/Text/Manual) → 
AI Analysis → Review & Edit → Save → AI Feedback
```

### 3. Progress Tracking
```
Dashboard → Progress → Select Timeframe → View Charts → 
Analyze Trends → Adjust Goals
```

### 4. Premium Upgrade
```
Free Feature Limit → Upgrade Prompt → Premium Page → 
Stripe Checkout → Subscription Activated → Premium Features
```

## Performance Optimizations

### Loading Performance
- **Next.js App Router**: Server components by default
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration

### Runtime Performance
- **SWR Caching**: Intelligent background updates and cache management
- **React Optimization**: useCallback, useMemo for expensive operations
- **Virtualization**: Large lists with react-window (if needed)
- **Debounced Search**: Reduced API calls for search functionality

### Mobile Performance
- **Touch Optimization**: Hardware-accelerated transitions
- **Image Compression**: Client-side image resizing before upload
- **Lazy Loading**: Progressive loading of non-critical components
- **Service Worker**: Offline support for core functionality (future)

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_url
```

## Browser Support
- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+
- **Progressive Enhancement**: Core features work in older browsers

## Accessibility
- **WCAG 2.1 AA**: Compliant color contrast and keyboard navigation
- **Screen Readers**: Semantic HTML with ARIA labels
- **Focus Management**: Visible focus indicators and logical tab order
- **Responsive Text**: Respects user font size preferences

## Future Enhancements
- **Offline Support**: Service worker for offline meal logging
- **Push Notifications**: Meal reminders and progress updates
- **Advanced Analytics**: Machine learning insights and predictions
- **Social Features**: Meal sharing and community challenges
- **Integrations**: Fitness trackers and health apps