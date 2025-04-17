from app import create_app, db
from sqlalchemy import text

# Create app context
app = create_app()
with app.app_context():
    # Add requirements column to mission table
    with db.engine.connect() as connection:
        connection.execute(text("ALTER TABLE mission ADD COLUMN requirements TEXT"))
        connection.commit()

print("Requirements column added successfully!")
