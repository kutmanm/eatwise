#!/usr/bin/env python3
"""
Database seeding script for EatWise application
Run this script to populate the database with sample data for development
"""

import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from seeds.seed_enhanced_data import main

if __name__ == "__main__":
    print("🚀 EatWise Database Seeder")
    print("=" * 50)
    main()