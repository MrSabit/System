from app import create_app, db
from app.models import User

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        print("Recreating database...")
        try:
            # Drop all tables
            db.drop_all()
            print("Dropped all tables")
            
            # Create all tables
            db.create_all()
            print("Created all tables")
            
            # Create a test user with all skills
            test_user = User(
                username="testuser",
                email="test@example.com",
                password_hash="testpassword",
                strength=1,
                endurance=1,
                flexibility=1,
                agility=1,
                stamina=1,
                growth=1,
                gaming=1,
                perception=1,
                creativity=1,
                memory=1,
                logic=1,
                focus=1,
                resilience=1,
                speaking=1,
                writing=1,
                empathy=1,
                persuasion=1,
                active_listening=1,
                time_management=1,
                organization=1,
                self_discipline=1,
                goal_setting=1,
                stress_management=1,
                research=1,
                analysis=1,
                critical_thinking=1,
                problem_solving=1,
                strategy=1
            )
            db.session.add(test_user)
            db.session.commit()
            print("Added test user with all skills")
            
            print("Database recreation completed successfully!")
        except Exception as e:
            print(f"Error recreating database: {str(e)}")
