# Database Seeding Guide

## Overview

This guide explains how to populate your EatWise database with realistic sample data for development and testing purposes.

## Available Seeding Scripts

### 1. Enhanced Data Seeder (`seeds/seed_enhanced_data.py`)

Creates comprehensive sample data including:
- **5 diverse sample users** with complete enhanced profiles
- **Realistic weight tracking history** (6+ months of data)
- **User feedback entries** with various types of feedback
- **Subscription data** for premium/trial users
- **Diet preferences** covering various dietary restrictions and preferences

### 2. Sample Data Generator (`utils/sample_data_generator.py`)

Utility functions for generating realistic data:
- Weight progression patterns based on goals
- Diverse diet preferences and allergies
- Realistic meal timing patterns
- User feedback variations

## Running the Seeding Scripts

### Method 1: Direct Script Execution

```bash
# Navigate to backend directory
cd backend

# Run the main seeding script
python scripts/seed_database.py
```

### Method 2: Python Module Execution

```bash
# From backend directory
python -m seeds.seed_enhanced_data
```

### Method 3: Alembic Integration (Recommended for Production)

```bash
# Create a custom alembic command (optional)
alembic -x seed=true upgrade head
```

## Sample Data Overview

### Users Created

1. **Sarah Johnson** (`sarah.johnson@example.com`)
   - **Role**: Free user
   - **Goal**: Weight loss (70kg → 60kg)
   - **Profile**: Vegetarian, nut allergy, moderately active
   - **Progress**: 5kg lost over 4 months

2. **Mike Chen** (`mike.chen@example.com`)
   - **Role**: Premium user
   - **Goal**: Muscle gain (75kg → 85kg)
   - **Profile**: Very active, shellfish allergy
   - **Progress**: 3kg gained over 6 months

3. **Emma Martinez** (`emma.martinez@example.com`)
   - **Role**: Trial user
   - **Goal**: Weight maintenance (62kg)
   - **Profile**: Gluten-free, dairy-free, advanced cook
   - **Progress**: Stable weight maintenance

4. **David Kim** (`david.kim@example.com`)
   - **Role**: Free user
   - **Goal**: Weight loss (95kg → 80kg)
   - **Profile**: Sedentary, low-carb diet
   - **Progress**: 7kg lost over 7 months

5. **Alex Taylor** (`alex.taylor@example.com`)
   - **Role**: Premium user
   - **Goal**: Body recomposition (68kg → 72kg)
   - **Profile**: Extremely active, paleo diet, expert cook
   - **Progress**: 2kg gained with body composition changes

### Sample Data Features

#### Weight Tracking
- **Realistic progression patterns** based on different goals
- **Natural fluctuations** and plateau periods
- **Motivational notes** reflecting real user experiences
- **6+ months of historical data** per user

#### Diet Preferences
- **Comprehensive dietary restrictions** (vegetarian, vegan, keto, paleo, etc.)
- **Common allergies** (nuts, shellfish, gluten, dairy)
- **Cuisine preferences** (Mediterranean, Asian, Mexican, etc.)
- **Cooking skill levels** and time preferences
- **Budget considerations**

#### User Feedback
- **Positive feedback** about features they love
- **Constructive suggestions** for improvements
- **Feature requests** from different user types
- **Diverse feedback styles** and lengths

## Customizing Sample Data

### Adding New Users

Edit `seeds/seed_enhanced_data.py` and add to the `sample_users` list:

```python
{
    "email": "new.user@example.com",
    "password": "password123",
    "role": UserRole.FREE,
    "profile": {
        "age": 30,
        "gender": Gender.FEMALE,
        # ... other profile fields
    },
    "weight_history": [
        {"weight": 65.0, "notes": "Starting point", "days_ago": 90},
        # ... more entries
    ],
    "feedback": [
        "Great app!",
        "Love the features"
    ]
}
```

### Modifying Weight Progression

Use the `SampleDataGenerator.generate_realistic_weight_progression()` method:

```python
progression = SampleDataGenerator.generate_realistic_weight_progression(
    initial_weight=70.0,
    target_weight=65.0,
    goal=GoalType.WEIGHT_LOSS,
    days=180
)
```

### Generating Random Profiles

Use the sample data generator for random realistic profiles:

```python
from utils.sample_data_generator import SampleDataGenerator

profile_data = SampleDataGenerator.generate_user_profile_data(age_range=(25, 45))
diet_prefs = SampleDataGenerator.generate_diet_preferences()
```

## Database Cleanup

The seeding script offers an option to clear existing sample data before creating new data:

```bash
python scripts/seed_database.py
# When prompted: "Clear existing sample data? (y/N):" 
# Type 'y' to clear existing sample users
```

## Production Considerations

### Data Privacy
- **Never run seeding scripts in production** with real user data
- Sample data uses `@example.com` email addresses
- All passwords are hashed using the same method as real users

### Performance
- Seeding creates **100+ database records** (users, profiles, weight logs, feedback)
- Run during off-peak hours if needed
- Consider using database transactions for rollback capability

### Testing Integration
- Sample data is perfect for **frontend development**
- Use for **API testing** and **user experience validation**
- Great for **demo environments** and **stakeholder presentations**

## Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   # Ensure you're in the backend directory
   cd backend
   # Check Python path
   python -c "import sys; print(sys.path)"
   ```

2. **Database Connection Issues**
   ```bash
   # Check database configuration
   # Ensure database server is running
   # Verify connection string in config
   ```

3. **Alembic Migration Conflicts**
   ```bash
   # Run migrations first
   alembic upgrade head
   # Then run seeding
   python scripts/seed_database.py
   ```

### Getting Help

- Check the console output for detailed error messages
- Verify database schema is up to date
- Ensure all required environment variables are set
- Check that dependencies are installed (`pip install -r requirements.txt`)

## Next Steps

After seeding:
1. **Test the application** with sample users
2. **Verify data integrity** through the API
3. **Check frontend display** of sample data
4. **Validate business logic** with realistic scenarios
5. **Demo features** using diverse user profiles

The seeded data provides a comprehensive foundation for development, testing, and demonstration of the enhanced EatWise features!