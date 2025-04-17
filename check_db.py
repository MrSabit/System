from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, text
import os

# Create engine
engine = create_engine(f"sqlite:///{os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'journey.sqlite')}")

# Get table information
with engine.connect() as connection:
    result = connection.execute(text("PRAGMA table_info(mission)"))
    columns = result.fetchall()
    print("Mission table columns:")
    for column in columns:
        print(column)

    # Check if requirements column exists
    requirements_column = next((col for col in columns if col[1] == 'requirements'), None)
    if requirements_column:
        print("\nRequirements column exists!")
    else:
        print("\nRequirements column does not exist!")
