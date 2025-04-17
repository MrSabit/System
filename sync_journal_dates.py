from app import create_app, db
from app.models import JournalEntry

app = create_app()

def sync_journal_dates():
    """Ensure all journal entries have both date and entry_date fields populated"""
    with app.app_context():
        # Get all journal entries
        entries = JournalEntry.query.all()
        updated_count = 0
        
        for entry in entries:
            updated = False
            
            # If entry has date but not entry_date
            if entry.date and not entry.entry_date:
                entry.entry_date = entry.date
                updated = True
                
            # If entry has entry_date but not date
            if entry.entry_date and not entry.date:
                entry.date = entry.entry_date
                updated = True
                
            if updated:
                updated_count += 1
                
        # Save all changes
        if updated_count > 0:
            db.session.commit()
            print(f"Updated {updated_count} journal entries to sync date fields")
        else:
            print("All journal entries already have synchronized date fields")

if __name__ == "__main__":
    sync_journal_dates() 