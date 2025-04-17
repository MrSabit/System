from app import create_app, db
from app.models import JournalEntry, User
from datetime import datetime
import json

app = create_app()

with app.app_context():
    print("=== DEBUG JOURNAL ENTRIES ===")
    
    # Get all users
    users = User.query.all()
    print(f"Found {len(users)} users in the database")
    
    # Check each user's journal entries
    for user in users:
        print(f"\nUser: {user.username} (ID: {user.id})")
        
        # Get all journal entries for this user
        entries = JournalEntry.query.filter_by(user_id=user.id).all()
        print(f"  Found {len(entries)} journal entries")
        
        # Print details of each entry
        for i, entry in enumerate(entries):
            print(f"\n  Entry #{i+1}: ID {entry.id}")
            print(f"    Title: {entry.title}")
            print(f"    Date field: {entry.date}")
            print(f"    Entry_date field: {entry.entry_date}")
            print(f"    Mood: {entry.mood}")
            print(f"    Content length: {len(entry.content)} chars")
            print(f"    Goals: {entry.goals}")
            print(f"    Created at: {entry.created_at}")
            print(f"    Updated at: {entry.updated_at}")
    
    print("\n=== END DEBUG ===")
    
    # Now check if we can create a test entry
    print("\nCreating a test entry...")
    
    test_user_id = users[0].id if users else 1
    
    try:
        test_entry = JournalEntry(
            user_id=test_user_id,
            date=datetime.now().date(),
            entry_date=datetime.now().date(),
            title="Test Entry",
            content="<p>This is a test entry</p>",
            mood="good",
            goals=json.dumps(["Test goal 1", "Test goal 2"])
        )
        
        db.session.add(test_entry)
        db.session.commit()
        print(f"Test entry created with ID: {test_entry.id}")
        
        # Now verify we can retrieve it
        retrieved = JournalEntry.query.get(test_entry.id)
        if retrieved:
            print("Successfully retrieved the test entry!")
            print(f"Title: {retrieved.title}")
            print(f"Date: {retrieved.date}")
        else:
            print("Failed to retrieve the test entry")
            
        # Now delete the test entry
        db.session.delete(test_entry)
        db.session.commit()
        print("Test entry removed from database")
        
    except Exception as e:
        print(f"Error while testing: {str(e)}")
        db.session.rollback() 