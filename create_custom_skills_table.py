from app import create_app, db
from app.models import CustomSkill

def create_custom_skills_table():
    print("Creating custom_skills table...")
    app = create_app()
    with app.app_context():
        # Create the table
        db.create_all()
        print("Database tables created successfully.")
        
        # Verify if the table exists
        try:
            # Try a simple query to check if the table exists
            CustomSkill.query.first()
            print("CustomSkill table exists and is accessible.")
        except Exception as e:
            print(f"Error accessing CustomSkill table: {e}")
            
    print("Done.")

if __name__ == "__main__":
    create_custom_skills_table() 