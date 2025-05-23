# The Journey - Personal Development Tracking System

A fantasy-themed personal development tracking system built with Flask and SQLAlchemy. Track your progress, set objectives, and complete quests to build a better version of yourself.

## Features

- Track multiple personal attributes: Strength, Education, Conversation, Appearance, Health, and Mindfulness
- Fantasy-themed dashboard with level and XP system
- Create daily, weekly, and monthly quests
- Set personal objectives and track your journey
- Beautiful UI with animations and rain effects
- Progress history to see your improvement over time

## Setup

1. Ensure you have Python 3.7+ installed

2. Activate the virtual environment
   ```
   venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On macOS/Linux
   ```

3. Install dependencies
   ```
   pip install flask flask-sqlalchemy
   ```

4. Initialize the database
   ```
   python init_db.py
   ```

5. Run the application
   ```
   python app.py
   ```

6. Open your browser and navigate to `http://127.0.0.1:5000`

   Test user credentials:
   - Username: testuser
   - Password: password

## Project Structure

```
.
├── app/
│   ├── __init__.py         # Flask application initialization
│   ├── models.py           # Database models
│   ├── routes.py           # Application routes
│   ├── static/             # Static files (CSS, JS, fonts)
│   │   ├── css/
│   │   │   └── style.css   # Application styles
│   │   ├── js/
│   │   │   └── main.js     # JavaScript functionality
│   │   └── fonts/          # Custom fonts
│   └── templates/          # HTML templates
│       ├── auth/           # Authentication templates
│       │   ├── login.html
│       │   └── register.html
│       ├── base.html       # Base template
│       ├── dashboard.html  # Main dashboard
│       ├── quests.html     # Quest management
│       ├── objectives.html # Objectives management
│       └── progress.html   # Progress tracking
│   └── instance/           # Instance-specific data
│       └── journey.sqlite  # SQLite database
├── app.py                  # Application entry point
├── init_db.py              # Database initialization script
└── README.md               # Project documentation
```

## Technologies Used

- Flask - Web framework
- SQLAlchemy - ORM for database operations
- SQLite - Database
- HTML/CSS/JavaScript - Frontend #   S y s t e m  
 