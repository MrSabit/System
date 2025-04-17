from flask_migrate import Migrate
from app import create_app, db
from flask_migrate import upgrade
from flask_migrate import migrate
from flask_migrate import init

app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    with app.app_context():
        print("Initializing migrations...")
        init()
        
        print("Creating migration...")
        migrate(message="add growth skill column")
        
        print("Upgrading database...")
        upgrade()
        
        print("Migration completed successfully!")
