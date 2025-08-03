# EatWise Backend - Docker Setup

This directory contains the Docker configuration for running the EatWise backend locally.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp env.template .env
   ```
   
2. **Edit the `.env` file** with your actual API keys and configuration:
   - Add your Supabase URL and keys
   - Add your OpenAI API key
   - Add your Stripe keys
   - Other settings can be left as default for local development

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **View logs (optional):**
   ```bash
   docker-compose logs -f backend
   ```

5. **Access the application:**
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## Services

The Docker Compose setup includes:

- **backend**: FastAPI application (port 8000)
- **database**: Uses Supabase PostgreSQL (no local database needed)

## Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild backend after code changes
docker-compose build backend
docker-compose up -d backend

# Access database
docker-compose exec db psql -U eatwise_user -d eatwise

# Access backend container
docker-compose exec backend bash

# Clean up everything (including volumes)
docker-compose down -v
```

## Database - Supabase PostgreSQL

Instead of running a local PostgreSQL container, this setup uses **Supabase PostgreSQL**:

### Getting Your Supabase Database URL:

1. **Go to Supabase Dashboard** → **Settings** → **Database**
2. **Find "Connection String"** section
3. **Copy the "Connection pooling" URL** (recommended for production):
   ```
   postgresql://postgres.gmcjymtgdvdmzwcjwkun:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. **Replace `[YOUR-PASSWORD]`** with your actual database password
5. **Use this for your `DATABASE_URL`** in `.env`

### Benefits of Using Supabase PostgreSQL:
- ✅ **No local database setup needed**
- ✅ **Built-in connection pooling**
- ✅ **Automatic backups**
- ✅ **Same database as your authentication**
- ✅ **Production-ready scaling**

## Development

The backend service is configured with hot-reload, so code changes will automatically restart the server. The current directory is mounted into the container at `/app`.

## Troubleshooting

1. **Port conflicts**: If port 8000 is already in use, modify the port mapping in `docker-compose.yml`

2. **Permission issues**: On Linux/macOS, you might need to run Docker commands with `sudo`

3. **Database connection issues**: 
   - Verify your Supabase `DATABASE_URL` is correct
   - Make sure you replaced `[YOUR-PASSWORD]` with your actual database password
   - Check your Supabase project is active and accessible

4. **Environment variables**: Double-check your `.env` file contains all required values

## Production Considerations

This setup is designed for local development. For production:
- Use environment-specific configurations
- Set up proper secrets management
- Configure SSL/TLS
- Set up backup strategies for the database
- Use production-grade reverse proxy (nginx, traefik, etc.)