from app import create_app, db
from app.models import JournalEntry
import sqlite3
import os
from datetime import datetime

# Create the app to get the right database path
app = create_app()

# The database path is in the app.instance_path
db_path = os.path.join(app.instance_path, 'journey.sqlite')
print(f"Using database at: {db_path}")

def update_database():
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if journal_entry table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='journal_entry'")
        if not cursor.fetchone():
            print("The journal_entry table doesn't exist yet. Creating tables with SQLAlchemy...")
            with app.app_context():
                db.create_all()
            print("Tables created successfully!")
            return
            
        # Get existing columns
        cursor.execute("PRAGMA table_info(journal_entry)")
        columns = cursor.fetchall()
        column_names = [column[1] for column in columns]
        
        # Add missing columns
        missing_columns = {
            'title': 'VARCHAR(100) NOT NULL DEFAULT "Untitled Entry"',
            'goals': 'TEXT',
            'created_at': f'TIMESTAMP NOT NULL DEFAULT "{datetime.utcnow()}"',
            'updated_at': f'TIMESTAMP NOT NULL DEFAULT "{datetime.utcnow()}"'
        }
        
        for col_name, col_def in missing_columns.items():
            if col_name not in column_names:
                print(f"Adding '{col_name}' column to journal_entry table...")
                cursor.execute(f"ALTER TABLE journal_entry ADD COLUMN {col_name} {col_def}")
                conn.commit()
                print(f"Column '{col_name}' added successfully!")
            else:
                print(f"The '{col_name}' column already exists in the journal_entry table.")
        
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_database()
    
    # Now ensure all tables are properly created/updated
    with app.app_context():
        db.create_all()
        print("Database schema updated successfully!") 