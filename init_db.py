from app import create_app, db
from app.models import User, Objective, QuestCategory, ProgressRecord, QuestSettings

app = create_app()

with app.app_context():
    db.drop_all()  # Clear existing database
    db.create_all()
    print('Database initialized!')
    
    # Create a test user
    test_user = User(
        username='testuser',
        email='test@example.com',
        password_hash='password',
        level=3,
        xp=40,
        xp_to_next_level=100,
        # Physical & Strength-Based Skills
        strength=5.5,
        endurance=3.2,
        flexibility=2.8,
        agility=4.0,
        stamina=3.5,
        
        # Mental & Cognitive Skills
        perception=3.7,
        creativity=4.2,
        memory=3.0,
        logic=2.5,
        focus=3.8,
        
        # Communication & Social Skills
        speaking=4.0,
        writing=3.5,
        empathy=2.7,
        persuasion=3.2,
        active_listening=4.5,
        
        # Productivity & Discipline
        time_management=3.0,
        organization=2.5,
        self_discipline=4.2,
        goal_setting=3.7,
        stress_management=2.8,
        
        # Education & Technical Skills
        research=3.5,
        analysis=2.8,
        critical_thinking=4.0,
        problem_solving=3.7,
        strategy=4.2
    )
    db.session.add(test_user)
    db.session.commit()  # Commit to get an ID for the user
    
    # Add default quest settings
    default_settings = QuestSettings(
        user_id=test_user.id,
        base_xp=25,
        auto_submit=True,
        custom_quests_enabled=False,
        notification_enabled=True,
        skill_increase_min=0.2,
        skill_increase_max=1.0,
        grace_period_hours=12
    )
    db.session.add(default_settings)
    
    # Add initial objective
    initial_objective = Objective(
        title="Complete 5 strength exercises",
        description="Start your journey by completing 5 strength exercises",
        is_active=True,
        user_id=test_user.id
    )
    db.session.add(initial_objective)
    
    db.session.commit()
    print('Sample data added!') 