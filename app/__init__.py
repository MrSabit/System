from flask import Flask, g, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
import os

db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        DATABASE=os.path.join(app.instance_path, 'journey.sqlite'),
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(app.instance_path, 'journey.sqlite')}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_TYPE='filesystem',
        PERMANENT_SESSION_LIFETIME=3600 * 24 * 7,
        SESSION_COOKIE_SECURE=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
    )

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Initialize database
    db.init_app(app)
    
    # Initialize Flask-Migrate
    with app.app_context():
        migrate.init_app(app, db)
    
    # Initialize Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = 'journey.login'
    
    from . import routes
    app.register_blueprint(routes.bp)
    
    # Register the journal blueprint
    from . import journal_routes
    app.register_blueprint(journal_routes.journal_bp)
    
    @app.route('/hello')
    def hello():
        return 'Hello, World!'
    
    # Ensure sessions are made permanent
    @app.before_request
    def make_session_permanent():
        session.permanent = True
    
    return app