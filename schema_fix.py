import sqlite3
import os

def fix_db_schema():
    try:
        print("Attempting to fix database schema...")
        
        # Connect directly to SQLite database
        db_path = os.path.join('instance', 'app.db')
        print(f"Connecting to database: {db_path}")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the custom_skills table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='custom_skills'")
        if cursor.fetchone():
            print("custom_skills table exists")
            
            # Check for the required columns
            cursor.execute("PRAGMA table_info(custom_skills)")
            columns = {column[1] for column in cursor.fetchall()}
            print(f"Existing columns: {', '.join(columns)}")
            
            # Check if the columns we need are missing
            missing_columns = []
            if 'category_name' not in columns:
                missing_columns.append("category_name VARCHAR(100)")
            if 'category_color' not in columns:
                missing_columns.append("category_color VARCHAR(20)")
                
            if missing_columns:
                print(f"Missing columns: {missing_columns}")
                
                # Create a temporary table with the correct schema
                print("Creating temporary table with correct schema")
                cursor.execute('''
                CREATE TABLE custom_skills_new (
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
                
                # Copy data from the old table to the new table
                print("Copying data to new table")
                
                # Build a dynamic query based on existing columns
                source_columns = ", ".join([c for c in columns])
                target_columns = source_columns
                
                # Add NULL for the missing columns
                for col in missing_columns:
                    col_name = col.split()[0]
                    target_columns += f", NULL as {col_name}"
                
                cursor.execute(f"INSERT INTO custom_skills_new SELECT {target_columns} FROM custom_skills")
                
                # Drop the old table
                print("Dropping old table")
                cursor.execute("DROP TABLE custom_skills")
                
                # Rename the new table
                print("Renaming new table to custom_skills")
                cursor.execute("ALTER TABLE custom_skills_new RENAME TO custom_skills")
                
                conn.commit()
                print("Schema fixed successfully!")
            else:
                print("Table schema appears to be correct. No fixes needed.")
        else:
            print("custom_skills table doesn't exist. Creating it.")
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
            print("Table created successfully!")
            
        # Verify the schema
        cursor.execute("PRAGMA table_info(custom_skills)")
        columns = cursor.fetchall()
        print("\nVerified table schema:")
        for col in columns:
            print(f"  {col[0]}: {col[1]} ({col[2]})")
            
        conn.close()
        
    except Exception as e:
        print(f"Error fixing schema: {e}")
        
if __name__ == "__main__":
    fix_db_schema() 