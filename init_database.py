from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        print("Initializing database...")
        try:
            # Drop all tables first
            db.drop_all()
            print("Dropped all tables")
            
            # Create all tables
            db.create_all()
            print("Created all tables")
            
            # Create a test user with growth skill
            test_user = User(
                username="testuser",
                email="test@example.com",
                password_hash=generate_password_hash("testpassword"),
                strength=1,
                endurance=1,
                flexibility=1,
                agility=1,
                stamina=1,
                growth=1  # Add growth skill
            )
            db.session.add(test_user)
            db.session.commit()
            print("Added test user with growth skill")
            
            print("Database initialization completed successfully!")
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
