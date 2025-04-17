from flask_migrate import upgrade
from app import create_app, db
from app.models import User  # Import the User model

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        print("Applying migration...")
        try:
            # Apply the migration
            upgrade()
            print("Migration applied successfully!")
            
            # Verify the column exists
            user = db.session.query(User).first()
            if hasattr(user, 'growth'):
                print("Growth column verified in User model!")
            else:
                print("Warning: Growth column not found in User model!")
        except Exception as e:
            print(f"Error applying migration: {str(e)}")
