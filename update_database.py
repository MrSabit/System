from app import create_app, db
from app.models import User
from sqlalchemy import Float, text

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        print("Adding growth column to database...")
        try:
            # Add the growth column
            db.engine.execute(text("ALTER TABLE user ADD COLUMN growth FLOAT DEFAULT 1"))
            print("Column added successfully!")
            
            # Update all existing users to have growth = 1
            db.engine.execute(text("UPDATE user SET growth = 1"))
            print("Updated existing users!")
            
            # Commit the changes
            db.session.commit()
            print("Database updated successfully!")
        except Exception as e:
            print(f"Error updating database: {str(e)}")
