from app import create_app, db
from app.models import User
from sqlalchemy import Float

app = create_app()

with app.app_context():
    # Create a new column in the User model
    db.engine.execute("ALTER TABLE user ADD COLUMN growth FLOAT DEFAULT 1")
    print("Column added successfully!")
    
    # Update all existing users to have growth = 1
    db.engine.execute("UPDATE user SET growth = 1")
    print("Updated existing users!")
    
    # Commit the changes
    db.session.commit()
    print("Database updated successfully!")
    
    # Verify the column was added
    user = User.query.first()
    if hasattr(user, 'growth'):
        print("Growth column verified in User model!")
    else:
        print("Warning: Growth column not found in User model!")
