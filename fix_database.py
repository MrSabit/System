from app import create_app, db
from sqlalchemy import text

def fix_mission_table():
    print("==== Database Fix Script ====")
    
    try:
        # Check if the is_failed column exists
        print("Checking if mission table columns exist...")
        result = db.session.execute(text("PRAGMA table_info(mission)"))
        columns = [row[1] for row in result.fetchall()]
        
        # Add missing columns
        if 'is_failed' not in columns:
            print("Adding is_failed column to mission table...")
            db.session.execute(text("ALTER TABLE mission ADD COLUMN is_failed BOOLEAN DEFAULT 0"))
            db.session.commit()
            print("is_failed column added successfully!")
        else:
            print("is_failed column already exists.")
            
        if 'deadline' not in columns:
            print("Adding deadline column to mission table...")
            db.session.execute(text("ALTER TABLE mission ADD COLUMN deadline DATETIME"))
            db.session.commit()
            print("deadline column added successfully!")
        else:
            print("deadline column already exists.")
        
        print("\nDatabase fix completed successfully!")
        return True
    except Exception as e:
        print(f"Error fixing database: {str(e)}")
        db.session.rollback()
        return False

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        fix_mission_table() 