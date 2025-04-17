from flask import Flask
from flask_migrate import Migrate
from app import create_app, db

app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    with app.app_context():
        print("Applying resilience migration...")
        try:
            # Apply the migration
            from flask_migrate import upgrade
            upgrade()
            print("Migration applied successfully!")
            
            # Verify the column exists
            from app.models import User
            user = db.session.query(User).first()
            if hasattr(user, 'resilience'):
                print("Resilience column verified in User model!")
            else:
                print("Warning: Resilience column not found in User model!")
        except Exception as e:
            print(f"Error applying migration: {str(e)}")
