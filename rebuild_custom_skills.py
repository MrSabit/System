import sqlite3
import os
import sys
from datetime import datetime

def rebuild_custom_skills_table():
    print("Rebuilding custom_skills table with new schema...")
    
    # Get the database path from command line or use default
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        db_path = os.path.join('instance', 'app.db')
    
    print(f"Using database at: {db_path}")
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Use Row factory for named columns
    cursor = conn.cursor()
    
    # Check if the table exists and backup existing skills
    existing_skills = []
    try:
        print("Checking for existing custom_skills table...")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='custom_skills'")
        if cursor.fetchone():
            print("Table exists, backing up data...")
            cursor.execute("SELECT * FROM custom_skills")
            existing_skills = [dict(row) for row in cursor.fetchall()]
            print(f"Backed up {len(existing_skills)} skills")
        else:
            print("Table doesn't exist yet")
    except sqlite3.OperationalError as e:
        print(f"Error checking table: {e}")
    
    # Create a backup of the entire table
    if existing_skills:
        try:
            cursor.execute("CREATE TABLE IF NOT EXISTS custom_skills_backup AS SELECT * FROM custom_skills")
            print("Created backup table: custom_skills_backup")
        except sqlite3.OperationalError as e:
            print(f"Error creating backup table: {e}")
    
    # Drop the existing table
    try:
        cursor.execute("DROP TABLE IF EXISTS custom_skills")
        conn.commit()
        print("Dropped existing custom_skills table")
    except sqlite3.OperationalError as e:
        print(f"Error dropping table: {e}")
        
    # Create the new table with the updated schema
    try:
        cursor.execute('''
        CREATE TABLE custom_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category VARCHAR(50) NOT NULL,
            category_name VARCHAR(100),
            category_color VARCHAR(20),
            name VARCHAR(100) NOT NULL,
            icon VARCHAR(10) NOT NULL,
            description TEXT,
            level FLOAT DEFAULT 1.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES user (id)
        )
        ''')
        conn.commit()
        print("Created new custom_skills table with updated schema")
    except sqlite3.OperationalError as e:
        print(f"Error creating new table: {e}")
        return
    
    # Restore the data
    if existing_skills:
        print("Restoring skill data...")
        for skill in existing_skills:
            try:
                # Check what columns were in the original skill
                columns = skill.keys()
                
                # Build the INSERT statement dynamically based on available columns
                insert_columns = ["user_id", "category", "name", "icon", "description", "level"]
                values = [skill["user_id"], skill["category"], skill["name"], skill["icon"], 
                         skill.get("description", ""), skill.get("level", 1.0)]
                
                # Add the new columns with default values
                if "category_name" not in columns:
                    insert_columns.append("category_name")
                    # For custom categories, use the category as the name
                    if skill["category"].startswith("custom_"):
                        category_name = skill["category"].replace("custom_", "").replace("_", " ").title()
                        values.append(category_name)
                    else:
                        values.append(None)
                else:
                    insert_columns.append("category_name")
                    values.append(skill["category_name"])
                    
                if "category_color" not in columns:
                    insert_columns.append("category_color")
                    values.append(None)
                else:
                    insert_columns.append("category_color")
                    values.append(skill["category_color"])
                
                # Add timestamps
                if "created_at" in columns:
                    insert_columns.append("created_at")
                    values.append(skill["created_at"])
                if "updated_at" in columns:
                    insert_columns.append("updated_at")
                    values.append(skill["updated_at"])
                
                # Generate the placeholder string (?)
                placeholders = ", ".join(["?"] * len(values))
                
                # Create the SQL
                sql = f"INSERT INTO custom_skills ({', '.join(insert_columns)}) VALUES ({placeholders})"
                
                # Execute the insert
                cursor.execute(sql, values)
                print(f"Restored skill: {skill['name']}")
            except Exception as e:
                print(f"Error restoring skill {skill.get('name', 'unknown')}: {e}")
        
        conn.commit()
        print(f"Restored {len(existing_skills)} skills to the new table")
    
    # Close the connection
    conn.close()
    print("Done! The custom_skills table has been rebuilt with the new schema.")

if __name__ == "__main__":
    rebuild_custom_skills_table() 