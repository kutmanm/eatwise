from logging.config import fileConfig
import os
import sys

# Add the parent directory to sys.path so we can import our models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import our models
from models.user import Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Override sqlalchemy.url with environment variable if available
# Try multiple ways to get the database URL for better Docker compatibility
database_url = None

# Method 1: Try to get from settings (preferred)
try:
    from utils.config import settings
    database_url = settings.database_url
    print(f"Using DATABASE_URL from settings: {database_url[:30]}...")
except Exception as e:
    print(f"Could not load from settings: {e}")
    
# Method 2: Fallback to environment variable
if not database_url:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        print(f"Using DATABASE_URL from environment: {database_url[:30]}...")
    
# Method 3: Final fallback to default
if not database_url:
    database_url = "postgresql://user:password@localhost/eatwise"
    print(f"Using default DATABASE_URL: {database_url}")

config.set_main_option("sqlalchemy.url", database_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
