from app import create_app, db
from app.models import JournalEntry
from datetime import datetime

app = create_app()

def fix_journal_dates():
    """Fix all journal entries to ensure date field matches entry_date where appropriate"""
    with app.app_context():
        # Get all journal entries
        entries = JournalEntry.query.all()
        updated_count = 0
        
        print(f"Examining {len(entries)} journal entries")
        
        for entry in entries:
            updated = False
            
            # If date is set to default 2025-01-01 but entry_date is different, update date
            if entry.date and entry.date.year == 2025 and entry.date.month == 1 and entry.date.day == 1:
                if entry.entry_date and entry.entry_date != entry.date:
                    print(f"Fixing entry {entry.id}: date={entry.date} -> {entry.entry_date}")
                    entry.date = entry.entry_date
                    updated = True
            
            # Ensure title is not null
            if not entry.title:
                entry.title = "Untitled Entry"
                updated = True
                
            # Ensure mood is not null
            if not entry.mood:
                entry.mood = "neutral"
                updated = True
                
            if updated:
                updated_count += 1
                
        # Save all changes
        if updated_count > 0:
            db.session.commit()
            print(f"Updated {updated_count} journal entries to fix dates and missing fields")
        else:
            print("All journal entries are already correctly formatted")

if __name__ == "__main__":
    fix_journal_dates() 