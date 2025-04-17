import sqlite3
import os
from datetime import datetime

def add_test_skill():
    try:
        print("Adding a test skill directly using SQLite...")
        
        # Connect directly to SQLite database
        db_path = os.path.join('instance', 'app.db')
        print(f"Connecting to database: {db_path}")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Disable foreign key constraints temporarily
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # User ID to use (usually 1 for testing)
        user_id = 1
            
        # Check the schema to make sure we get the column names right
        cursor.execute("PRAGMA table_info(custom_skills)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Table columns: {', '.join(columns)}")
        
        # Current timestamp
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Skill data
        skill_data = {
            'user_id': user_id,
            'category': 'test_category',
            'name': 'Test Skill',
            'icon': '🧪',
            'description': 'This is a test skill added directly via SQLite',
            'level': 1.0,
            'created_at': now,
            'updated_at': now
        }
        
        # Only include category_name and category_color if they exist in the schema
        if 'category_name' in columns:
            skill_data['category_name'] = 'Test Category'
        
        if 'category_color' in columns:
            skill_data['category_color'] = '#ff5733'
            
        # Build the SQL INSERT statement
        fields = ', '.join(skill_data.keys())
        placeholders = ', '.join(['?' for _ in skill_data])
        
        sql = f"INSERT INTO custom_skills ({fields}) VALUES ({placeholders})"
        
        # Execute the SQL
        try:
            cursor.execute(sql, list(skill_data.values()))
            conn.commit()
            
            # Get the last inserted ID
            skill_id = cursor.lastrowid
            
            print(f"Skill added successfully with ID: {skill_id}")
            
            # Verify the skill was added
            cursor.execute("SELECT * FROM custom_skills WHERE id = ?", (skill_id,))
            skill = cursor.fetchone()
            
            if skill:
                print("Skill details:")
                for i, col in enumerate(columns):
                    print(f"  {col}: {skill[i]}")
            else:
                print("Skill was not found after insertion!")
        except sqlite3.OperationalError as e:
            print(f"SQLite operational error: {e}")
            print("Attempting simpler insert without category_name and category_color...")
            
            # Try a simpler insert without the problematic columns
            basic_skill_data = {
                'user_id': user_id,
                'category': 'test_category',
                'name': 'Test Skill',
                'icon': '🧪',
                'description': 'This is a test skill added directly via SQLite',
                'level': 1.0
            }
            
            fields = ', '.join(basic_skill_data.keys())
            placeholders = ', '.join(['?' for _ in basic_skill_data])
            
            sql = f"INSERT INTO custom_skills ({fields}) VALUES ({placeholders})"
            
            try:
                cursor.execute(sql, list(basic_skill_data.values()))
                conn.commit()
                
                skill_id = cursor.lastrowid
                print(f"Basic skill added successfully with ID: {skill_id}")
            except Exception as e2:
                print(f"Failed to add basic skill: {e2}")
                
                # Last resort: try the absolute minimum
                print("Trying minimum required fields...")
                min_sql = "INSERT INTO custom_skills (user_id, category, name, icon) VALUES (?, ?, ?, ?)"
                cursor.execute(min_sql, (user_id, 'minimal', 'Minimal Test', '🔧'))
                conn.commit()
                
                skill_id = cursor.lastrowid
                print(f"Minimal skill added with ID: {skill_id}")
            
        # Re-enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON")
        conn.close()
        
    except Exception as e:
        print(f"Error adding skill: {e}")
        
if __name__ == "__main__":
    add_test_skill() 