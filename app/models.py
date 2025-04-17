from types import new_class
from app import db, login_manager
from datetime import datetime
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

# Schema trigger comment - modified

class QuestCategory(Enum):
    STRENGTH = 'Strength'
    EDUCATION = 'Education'
    CONVERSATION = 'Conversation'
    APPEARANCE = 'Appearance'
    MINDFULNESS = 'Mindfulness'
    HEALTH = 'Health'
    SKILL = 'Skill'
    PHYSICAL = 'Physical'
    MENTAL = 'Mental'
    DISCIPLINE = 'Discipline'
    COMMUNICATION = 'Communication'
    PERCEPTION = 'Perception'
    AGILITY = 'Agility'
    CREATIVITY = 'Creativity'
    STAMINA = 'Stamina'
    LISTENING = 'Listening'
    CHARISMA = 'Charisma'
    MEMORY = 'Memory'
    PERSUASION = 'Persuasion'
    STRATEGY = 'Strategy'


class QuestStatus(Enum):
    PENDING = 'Pending'
    IN_PROGRESS = 'In Progress'
    COMPLETED = 'Completed'
    FAILED = 'Failed'

# User loader for Flask-Login
@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    level = db.Column(db.Integer, default=0)
    xp = db.Column(db.Integer, default=0)
    xp_to_next_level = db.Column(db.Integer, default=100)  # 100 XP to reach level 1
    
    # Skills
    # Physical & Strength-Based Skills
    strength = db.Column(db.Float, default=1)
    endurance = db.Column(db.Float, default=1)
    flexibility = db.Column(db.Float, default=1)
    agility = db.Column(db.Float, default=1)
    stamina = db.Column(db.Float, default=1)
    growth = db.Column(db.Float, default=1)  # Track physical development and growth
    
    # Gaming Skills
    gaming = db.Column(db.Float, default=1)
    
    # Mental & Cognitive Skills
    perception = db.Column(db.Float, default=1)
    creativity = db.Column(db.Float, default=1)
    memory = db.Column(db.Float, default=1)
    logic = db.Column(db.Float, default=1)
    focus = db.Column(db.Float, default=1)
    resilience = db.Column(db.Float, default=1)  # Added resilience skill
    
    # Communication & Social Skills
    speaking = db.Column(db.Float, default=1)
    writing = db.Column(db.Float, default=1)
    empathy = db.Column(db.Float, default=1)
    persuasion = db.Column(db.Float, default=1)
    active_listening = db.Column(db.Float, default=1)
    
    # Productivity & Discipline
    time_management = db.Column(db.Float, default=1)
    organization = db.Column(db.Float, default=1)
    self_discipline = db.Column(db.Float, default=1)
    goal_setting = db.Column(db.Float, default=1)
    stress_management = db.Column(db.Float, default=1)
    
    # Education & Technical Skills
    research = db.Column(db.Float, default=1)
    analysis = db.Column(db.Float, default=1)
    critical_thinking = db.Column(db.Float, default=1)
    problem_solving = db.Column(db.Float, default=1)
    strategy = db.Column(db.Float, default=1)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    quest_settings = db.relationship('QuestSettings', backref='user', uselist=False)
    missions = db.relationship('Mission', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_progress_percentage(self):
        if self.xp_to_next_level is None or self.xp_to_next_level == 0:
            return 100
        if self.xp is None:
            return 0
        return (self.xp / self.xp_to_next_level) * 100
    
    def __repr__(self):
        return f'<User {self.username}>'

    def get_xp_multiplier(self):
        """Check for active penalties and return the current XP multiplier"""
        # Check if there are any active penalties
        active_penalties = PenaltyPeriod.query.filter(
            PenaltyPeriod.user_id == self.id,
            PenaltyPeriod.is_active == True,
            PenaltyPeriod.end_date > datetime.utcnow()
        ).all()
        
        if not active_penalties:
            return 1.0  # No penalty, return full XP
            
        # If there are multiple penalties, use the most severe one (lowest multiplier)
        # This only affects XP calculations, all penalties are still displayed in the UI
        lowest_multiplier = min([penalty.penalty_rate for penalty in active_penalties])
        return lowest_multiplier
    
    def add_xp(self, amount):
        """Add XP with any active penalties applied"""
        multiplier = self.get_xp_multiplier()
        adjusted_amount = int(amount * multiplier)
        self.xp += adjusted_amount
        return adjusted_amount  # Return the actual amount added after penalties

class Objective(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(20), default='medium')  # Options: easy, medium, hard, extreme
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __repr__(self):
        return f'<Objective {self.title}>'

class PenaltyPeriod(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reason = db.Column(db.String(150), nullable=False)
    penalty_rate = db.Column(db.Float, default=0.5)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    difficulty = db.Column(db.String(20), nullable=False)
    
    user = db.relationship('User', backref=db.backref('penalties', lazy=True))
    
    def days_remaining(self):
        return (self.end_date - datetime.utcnow()).days + 1
    
    def set_as_inactive(self):
        self.is_active = False
        db.session.commit()

class ProgressRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(20), nullable=False)
    old_value = db.Column(db.Integer, nullable=False)
    new_value = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __repr__(self):
        return f'<ProgressRecord {self.category} {self.old_value} -> {self.new_value}>'

class QuestSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    base_xp = db.Column(db.Integer, default=25)
    auto_submit = db.Column(db.Boolean, default=True)
    custom_quests_enabled = db.Column(db.Boolean, default=False)
    custom_quests_path = db.Column(db.String(255), nullable=True)
    notification_enabled = db.Column(db.Boolean, default=True)
    skill_increase_min = db.Column(db.Float, default=0.2)
    skill_increase_max = db.Column(db.Float, default=1.0)
    grace_period_hours = db.Column(db.Integer, default=12)  # Hours to wait before auto-submitting
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<QuestSettings {self.id}>'

class Mission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=True)  # Added requirements field
    is_completed = db.Column(db.Boolean, default=False)
    is_failed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deadline = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    estimated_duration = db.Column(db.String(50), nullable=True)  # e.g., "2 weeks", "1 month"
    difficulty = db.Column(db.String(20), default='legendary')  # Higher than objectives: legendary
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __repr__(self):
        return f'<Mission {self.title}>'

class QuestCompletionRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    day_index = db.Column(db.Integer, nullable=False)  # 0-6 for Monday-Sunday
    completed_tasks = db.Column(db.Text, nullable=False, default='[]')  # JSON string of completed task indices
    is_completed = db.Column(db.Boolean, default=False)  # Fully completed
    is_partial = db.Column(db.Boolean, default=False)  # Partially completed
    completion_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('quest_completions', lazy=True))
    
    def __repr__(self):
        return f'<QuestCompletionRecord Day {self.day_index}>'
    
    def get_completed_tasks(self):
        """Convert the JSON string to a list"""
        import json
        return json.loads(self.completed_tasks)
    
    def set_completed_tasks(self, tasks_list):
        """Convert the list to a JSON string"""
        import json
        self.completed_tasks = json.dumps(tasks_list)

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    topics = db.relationship('Topic', backref='subject', lazy='dynamic', cascade='all, delete-orphan')
    study_sessions = db.relationship('StudySession', backref='subject', lazy='dynamic')
    
    user = db.relationship('User', backref=db.backref('subjects', lazy='dynamic'))
    
    def __repr__(self):
        return f'<Subject {self.name}>'
    
    def get_progress(self):
        total_topics = self.topics.count()
        if total_topics == 0:
            return 0
        
        # Calculate progress based on subtopics instead of just completed topics
        total_subtopics = 0
        completed_subtopics = 0
        
        for topic in self.topics:
            topic_subtopics = topic.subtopics.count()
            if topic_subtopics > 0:
                total_subtopics += topic_subtopics
                completed_subtopics += topic.subtopics.filter_by(is_completed=True).count()
            else:
                # If topic has no subtopics, count the topic itself
                total_subtopics += 1
                if topic.is_completed:
                    completed_subtopics += 1
        
        if total_subtopics == 0:
            return 0
            
        return int((completed_subtopics / total_subtopics) * 100)

class Topic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    subtopics = db.relationship('Subtopic', backref='topic', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Topic {self.name}>'
    
    def complete(self):
        self.is_completed = True
        self.completed_at = datetime.utcnow()
    
    def uncomplete(self):
        self.is_completed = False
        self.completed_at = None
        
    def get_progress(self):
        total_subtopics = self.subtopics.count()
        if total_subtopics == 0:
            return 100 if self.is_completed else 0
        
        completed_subtopics = self.subtopics.filter_by(is_completed=True).count()
        return int((completed_subtopics / total_subtopics) * 100)

class Subtopic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        return f'<Subtopic {self.name}>'
    
    def complete(self):
        self.is_completed = True
        self.completed_at = datetime.utcnow()
    
    def uncomplete(self):
        self.is_completed = False
        self.completed_at = None

class StudySession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hours = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('study_sessions', lazy='dynamic'))
    
    def __repr__(self):
        return f'<StudySession {self.date} - {self.hours} hours>'

class CustomSkill(db.Model):
    __tablename__ = 'custom_skills'
    
    print("Defining CustomSkill model...")
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # physical, mental, communication, productivity, education, custom
    category_name = db.Column(db.String(100), nullable=True)  # For custom categories
    category_color = db.Column(db.String(20), nullable=True)  # HEX color code for custom categories
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(10), nullable=False)  # Emoji or icon representation
    description = db.Column(db.Text)
    level = db.Column(db.Float, default=1.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    print("CustomSkill columns defined")
    
    user = db.relationship('User', backref=db.backref('custom_skills', lazy=True))
    
    def __repr__(self):
        return f'<CustomSkill {self.name} (Level {self.level})>'

class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Legacy field - kept for database compatibility
    entry_date = db.Column(db.Date, nullable=False)
    
    # Primary date field used for display and API
    date = db.Column(db.Date, nullable=False, default=datetime.now().date)
    
    title = db.Column(db.String(100), nullable=False, default="Untitled Entry")
    content = db.Column(db.Text, nullable=False, default="")
    mood = db.Column(db.String(20), nullable=False, default="neutral")  # 'amazing', 'good', 'neutral', 'low', 'terrible'
    goals = db.Column(db.Text)  # JSON string of goals
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('journal_entries', lazy=True))
    
    def __repr__(self):
        return f'<JournalEntry {self.id} - {self.date.strftime("%Y-%m-%d")} - {self.title}>'