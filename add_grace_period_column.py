import sqlite3

def add_grace_period_column():
    """Add grace_period_hours column to quest_settings table."""
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect('instance/app.db')
        cursor = conn.cursor()
        
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(quest_settings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'grace_period_hours' not in columns:
            # Add the new column with a default value of 12
            cursor.execute("ALTER TABLE quest_settings ADD COLUMN grace_period_hours INTEGER DEFAULT 12")
            print("Added grace_period_hours column to quest_settings table")
        else:
            print("grace_period_hours column already exists")
        
        # Commit the changes and close the connection
        conn.commit()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Error adding grace_period_hours column: {e}")
        return False

if __name__ == "__main__":
    add_grace_period_column() 