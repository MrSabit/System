from app import create_app
import sqlite3
import os

# Create the app to get the right database path
app = create_app()

# The database path is in the app.instance_path
db_path = os.path.join(app.instance_path, 'journey.sqlite')
print(f"Using database at: {db_path}")

def check_table_schema():
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if journal_entry table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='journal_entry'")
        if not cursor.fetchone():
            print("The journal_entry table doesn't exist yet.")
            return
            
        # Display table schema
        print("\nJournal Entry Table Schema:")
        cursor.execute("PRAGMA table_info(journal_entry)")
        columns = cursor.fetchall()
        
        print("ID | NAME | TYPE | NOTNULL | DEFAULT | PK")
        print("-" * 60)
        for column in columns:
            print(f"{column[0]} | {column[1]} | {column[2]} | {column[3]} | {column[4]} | {column[5]}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_table_schema() 