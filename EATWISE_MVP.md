# EatWise MVP - Meal Tracking & Nutrition App

## Overview
EatWise is a modern meal tracking application that helps users monitor their nutrition intake through text descriptions and photo analysis. The app provides personalized coaching based on user goals and daily intake patterns.

## Core Features

### 1. User Authentication & Profile Management
- **Supabase Auth Integration**: Secure user registration and login
- **User Profiles**: Store personal information, dietary goals, and preferences
- **Goal Setting**: Calorie targets, macronutrient ratios, and health objectives

### 2. Meal Logging System
- **Text-Based Entry**: Users can describe meals in natural language
- **Photo Analysis**: Upload meal photos for automatic nutrition analysis
- **Dual AI Processing**: 
  - Text parsing using OpenAI GPT-4o
  - Vision analysis using OpenAI GPT-4o
- **Manual Adjustments**: Users can edit AI-generated nutrition estimates

### 3. Nutrition Tracking & Analytics
- **Real-Time Dashboard**: Daily calorie and macro tracking
- **Visual Analytics**: Charts showing nutrition trends over time
- **Progress Monitoring**: Compare actual intake vs. goals
- **Historical Data**: Access to past meal logs and nutrition history

### 4. AI-Powered Coaching
- **Daily Insights**: Personalized feedback based on nutrition patterns
- **Goal-Based Recommendations**: Suggestions aligned with user objectives
- **Improvement Tips**: 1-2 actionable suggestions for next day

### 5. Premium Features (Future)
- **Advanced Analytics**: Detailed nutrition reports and trends
- **Custom Meal Plans**: AI-generated meal suggestions
- **Export Capabilities**: Data export for healthcare providers

## Technical Stack

### Backend (FastAPI + PostgreSQL)
- **Framework**: FastAPI with async support
- **Database**: PostgreSQL with SQLAlchemy 2.0 ORM
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage for meal photos
- **AI Integration**: OpenAI GPT-4o for text and vision processing
- **Hosting**: Render

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: TailwindCSS with mobile-first design
- **State Management**: Context API + Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: SWR for caching and synchronization
- **Charts**: Recharts for nutrition visualizations
- **Hosting**: Render

## MVP User Flow

### 1. Onboarding
1. User signs up/logs in via Supabase Auth
2. Complete profile setup (age, weight, goals, dietary preferences)
3. Set nutrition targets (calories, protein, fat, carbs)

### 2. Daily Usage
1. **Log Meals**: Add meals via text description or photo upload
2. **Review Nutrition**: View processed nutrition data and make adjustments
3. **Track Progress**: Monitor daily intake on dashboard
4. **Receive Coaching**: Get AI-powered insights and recommendations

### 3. Analytics & History
1. **View Trends**: Access historical nutrition data and charts
2. **Analyze Patterns**: Identify eating habits and progress over time
3. **Adjust Goals**: Modify targets based on progress and coaching

## Key Metrics for MVP Success
- **User Engagement**: Daily active users logging at least one meal
- **AI Accuracy**: User satisfaction with nutrition estimations
- **Retention**: Week-over-week user retention rates
- **Goal Achievement**: Users meeting their nutrition targets

## MVP Scope Limitations
- **Single User Type**: Focus on general health-conscious individuals
- **Basic Analytics**: Simple charts and trends (no advanced reporting)
- **Manual Goal Setting**: No AI-powered goal recommendations initially
- **English Only**: Single language support for MVP
- **Mobile Web**: Responsive web app (no native mobile apps)