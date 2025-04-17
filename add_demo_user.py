#!/usr/bin/env python
from app import create_app, db
from app.models import User, Objective, QuestSettings, ProgressRecord
from datetime import datetime, timedelta
import random

app = create_app()

def add_demo_user():
    with app.app_context():
        # Check if user already exists and delete if found
        existing_user = User.query.filter_by(username='sabit').first()
        if existing_user:
            print("Removing existing demo user 'sabit'")
            # Delete associated records
            QuestSettings.query.filter_by(user_id=existing_user.id).delete()
            Objective.query.filter_by(user_id=existing_user.id).delete()
            ProgressRecord.query.filter_by(user_id=existing_user.id).delete()
            # Delete user
            db.session.delete(existing_user)
            db.session.commit()
            
        # Create new user
        user = User(
            username='sabit',
            email='miftahulislamsabit2@gamil.com',
            level=3,                    # Start at level 3
            xp=75,                      # 75/200 XP for level 4
            xp_to_next_level=200,       # 200 XP to reach level 4
            
            # Boost some skills to create variation
            strength=3.5,               # Boosted
            endurance=2.7,              # Boosted
            flexibility=1.9,            
            agility=2.2,                # Boosted
            stamina=2.0,                # Boosted
            
            perception=1.8,
            creativity=3.2,             # Boosted
            memory=2.1,                 # Boosted
            logic=1.7,
            focus=2.6,                  # Boosted
            
            speaking=2.8,               # Boosted
            writing=2.4,                # Boosted
            empathy=1.6,
            persuasion=1.5,
            active_listening=2.3,       # Boosted
            
            time_management=3.0,        # Boosted
            organization=2.5,           # Boosted
            self_discipline=2.9,        # Boosted
            goal_setting=2.2,           # Boosted
            stress_management=1.4,
            
            research=1.9,
            analysis=2.0,               # Boosted
            critical_thinking=2.6,      # Boosted
            problem_solving=2.4,        # Boosted
            strategy=1.8
        )
        
        # Set password
        user.set_password('12345')
        
        # Add user to database
        db.session.add(user)
        db.session.commit()  # Commit to get user ID
        
        # Create quest settings
        settings = QuestSettings(
            user_id=user.id,
            base_xp=25,
            auto_submit=True,
            notification_enabled=True,
            custom_quests_enabled=False,
            skill_increase_min=0.2,
            skill_increase_max=1.0,
            grace_period_hours=12
        )
        db.session.add(settings)
        
        # Add objectives (1 active, 2 completed)
        active_objective = Objective(
            title="Complete 10 physical exercises this week",
            description="Focus on strength and endurance training to improve physical fitness",
            difficulty="medium",
            is_active=True,
            user_id=user.id
        )
        db.session.add(active_objective)
        
        # Add completed objectives
        completed_obj1 = Objective(
            title="Finish reading 'Atomic Habits'",
            description="Read the book and take notes on key concepts",
            difficulty="easy",
            is_active=False,
            created_at=datetime.utcnow() - timedelta(days=10),
            completed_at=datetime.utcnow() - timedelta(days=3),
            user_id=user.id
        )
        db.session.add(completed_obj1)
        
        completed_obj2 = Objective(
            title="Learn basic Python programming",
            description="Complete an introductory course on Python programming",
            difficulty="hard",
            is_active=False,
            created_at=datetime.utcnow() - timedelta(days=30),
            completed_at=datetime.utcnow() - timedelta(days=7),
            user_id=user.id
        )
        db.session.add(completed_obj2)
        
        # Add some progress records
        progress_records = [
            ProgressRecord(
                category="Strength",
                old_value=2.5,
                new_value=3.5,
                notes="Completed strength training program",
                created_at=datetime.utcnow() - timedelta(days=5),
                user_id=user.id
            ),
            ProgressRecord(
                category="Creativity",
                old_value=2.2,
                new_value=3.2,
                notes="Finished art project",
                created_at=datetime.utcnow() - timedelta(days=8),
                user_id=user.id
            ),
            ProgressRecord(
                category="Time Management",
                old_value=2.0,
                new_value=3.0,
                notes="Implemented new scheduling system",
                created_at=datetime.utcnow() - timedelta(days=2),
                user_id=user.id
            ),
            ProgressRecord(
                category="Speaking",
                old_value=1.8,
                new_value=2.8,
                notes="Gave presentation at work",
                created_at=datetime.utcnow() - timedelta(days=4),
                user_id=user.id
            ),
            ProgressRecord(
                category="Critical Thinking",
                old_value=1.6,
                new_value=2.6,
                notes="Completed logic puzzle challenge",
                created_at=datetime.utcnow() - timedelta(days=6),
                user_id=user.id
            )
        ]
        
        for record in progress_records:
            db.session.add(record)
            
        db.session.commit()
        print(f"Demo user created successfully: username='sabit', email='miftahulislamsabit2@gamil.com', password='12345'")

if __name__ == '__main__':
    add_demo_user() 