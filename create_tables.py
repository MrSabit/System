from app import create_app, db
from app.models import Mission

app = create_app()

with app.app_context():
    print("Creating Mission table...")
    db.create_all()
    print("Mission table created successfully!") 