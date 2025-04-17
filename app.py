from app import create_app, db
from app.models import User, Objective, ProgressRecord

app = create_app()

@app.cli.command('db')
def init_db():
    """Create and initialize the database."""
    db.drop_all()
    db.create_all()
    print('Database initialized!')

if __name__ == '__main__':
    app.run()
