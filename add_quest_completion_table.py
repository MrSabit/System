from flask import Flask
from app import create_app, db
from app.models import QuestCompletionRecord
from sqlalchemy import text

def add_quest_completion_table():
    """Add the QuestCompletionRecord table to the database."""
    app = create_app()
    
    with app.app_context():
        # Check if the table already exists
        try:
            db.session.execute(text("SELECT 1 FROM quest_completion_record LIMIT 1"))
            print("QuestCompletionRecord table already exists.")
            return
        except:
            # Table doesn't exist, create it
            print("Creating QuestCompletionRecord table...")
            
            # Create the table
            db.create_all()
            print("QuestCompletionRecord table created successfully.")

if __name__ == "__main__":
    add_quest_completion_table() 