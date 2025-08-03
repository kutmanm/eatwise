# EatWise Frontend - Docker & Environment Setup

This directory contains the Next.js frontend for EatWise with Docker configuration for local development.

## Required Environment Variables

The frontend needs these environment variables to run:

### 1. Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 2. Backend API Configuration  
- `NEXT_PUBLIC_API_URL` - URL of your FastAPI backend (default: http://localhost:8000)

## Quick Start (Local Development)

1. **Set up environment variables:**
   ```bash
   cp env.template .env.local
   ```

2. **Edit `.env.local`** with your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run with npm (recommended for development):**
   ```bash
   npm install
   npm run dev
   ```

4. **Or run with Docker:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to Settings → API
4. Copy:
   - **URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Docker Options

### Development (with hot reload)
```bash
# Start development server with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
# Build and run production version
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Development Commands

```bash
# Install dependencies
npm install

# Development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Connecting to Backend

Make sure your backend is running before starting the frontend:

1. **Backend running locally:**
   - Set `NEXT_PUBLIC_API_URL=http://localhost:8000`
   - Start backend with Docker: `cd ../backend && docker-compose up -d`

2. **Backend running on different host:**
   - Set `NEXT_PUBLIC_API_URL=http://your-backend-host:8000`

## Troubleshooting

### Common Issues

1. **"Failed to fetch" API errors:**
   - Check if backend is running on the URL specified in `NEXT_PUBLIC_API_URL`
   - Verify CORS is properly configured in backend

2. **Supabase connection errors:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
   - Check Supabase project is active

3. **Environment variables not working:**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Restart development server after changing `.env.local`
   - Check file is named exactly `.env.local` (not `.env`)

4. **Port conflicts:**
   - If port 3000 is in use, modify port mapping in docker-compose files
   - Or change port with npm: `npm run dev -- -p 3001`

### Docker Issues

1. **Build failures:**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

2. **Node modules issues:**
   ```bash
   # Remove local node_modules and rebuild
   rm -rf node_modules package-lock.json
   docker-compose -f docker-compose.dev.yml build --no-cache
   ```

## Full Stack Development

To run both frontend and backend together:

1. **Start backend:**
   ```bash
   cd ../backend
   cp env.template .env
   # Edit .env with your API keys
   docker-compose up -d
   ```

2. **Start frontend:**
   ```bash
   cd ../frontend
   cp env.template .env.local
   # Edit .env.local with Supabase credentials
   npm run dev
   ```

3. **Access applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs