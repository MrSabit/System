from flask import Flask
from app import create_app, db
from app.models import Subject, Topic, StudySession, Subtopic

def add_education_tables():
    """Add education-related tables to the database."""
    app = create_app()
    
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        print("Education tables created successfully!")
        print("The following tables were added or already exist:")
        print("- Subject")
        print("- Topic")
        print("- StudySession")
        print("- Subtopic")
        
        print("\nYou can now access the Education feature in The Journey app.")

if __name__ == "__main__":
    add_education_tables() 