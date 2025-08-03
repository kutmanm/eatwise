-- Initialize the EatWise database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- The eatwise database is automatically created by the postgres container

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by SQLAlchemy migrations)
-- These are just examples of what might be created

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON DATABASE eatwise TO eatwise_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eatwise_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eatwise_user;

-- You can add initial data here if needed
-- INSERT INTO your_table VALUES (...);