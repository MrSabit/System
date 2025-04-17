import sqlite3
import os
from flask import Flask

def add_columns_to_custom_skills():
    # Get the database path - assuming it's in the instance folder
    app = Flask(__name__)
    db_path = os.path.join(app.instance_path, 'journey.sqlite')
    
    print(f"Attempting to connect to database at: {db_path}")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(custom_skills)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add category_name column if it doesn't exist
        if 'category_name' not in columns:
            print("Adding category_name column...")
            cursor.execute("ALTER TABLE custom_skills ADD COLUMN category_name TEXT")
        else:
            print("category_name column already exists")
        
        # Add category_color column if it doesn't exist
        if 'category_color' not in columns:
            print("Adding category_color column...")
            cursor.execute("ALTER TABLE custom_skills ADD COLUMN category_color TEXT")
        else:
            print("category_color column already exists")
        
        # Commit changes and close connection
        conn.commit()
        conn.close()
        
        print("Database update completed successfully!")
        return True
    
    except Exception as e:
        print(f"Error updating database: {str(e)}")
        return False

if __name__ == "__main__":
    add_columns_to_custom_skills() 