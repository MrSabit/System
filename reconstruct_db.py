import sqlite3
import os
from app import create_app, db
from app.models import CustomSkill

def recreate_custom_skills_table():
    print("Recreating custom_skills table with new schema...")
    
    # Get the database path
    app = create_app()
    db_path = os.path.join(app.instance_path, 'app.db')
    print(f"Database path: {db_path}")
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if the table exists and get current skills
    existing_skills = []
    try:
        print("Fetching existing skills...")
        cursor.execute("SELECT id, user_id, category, name, icon, description, level, created_at, updated_at FROM custom_skills")
        existing_skills = cursor.fetchall()
        print(f"Found {len(existing_skills)} existing skills")
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
        print("custom_skills table doesn't exist or has a different structure")
    
    # Drop the existing table
    try:
        print("Dropping existing table...")
        cursor.execute("DROP TABLE IF EXISTS custom_skills")
        conn.commit()
        print("Table dropped successfully")
    except Exception as e:
        print(f"Error dropping table: {e}")
    
    # Close the connection
    conn.close()
    
    # Use SQLAlchemy to create the new table
    with app.app_context():
        print("Creating new custom_skills table with updated schema...")
        try:
            db.create_all()
            print("Table created successfully")
        except Exception as e:
            print(f"Error creating table: {e}")
        
        # Restore existing skills if any
        if existing_skills:
            print("Restoring existing skills...")
            for skill in existing_skills:
                # Create a new skill with the old data + default values for new columns
                try:
                    new_skill = CustomSkill(
                        id=skill[0],
                        user_id=skill[1],
                        category=skill[2],
                        category_name=None,  # Default for new column
                        category_color=None,  # Default for new column
                        name=skill[3],
                        icon=skill[4],
                        description=skill[5],
                        level=skill[6],
                        created_at=skill[7],
                        updated_at=skill[8]
                    )
                    db.session.add(new_skill)
                    print(f"Added skill: {new_skill}")
                except Exception as e:
                    print(f"Error adding skill: {e}")
            
            try:
                db.session.commit()
                print("Skills restored successfully")
            except Exception as e:
                db.session.rollback()
                print(f"Error restoring skills: {e}")
    
    print("Done.")

if __name__ == "__main__":
    recreate_custom_skills_table() 