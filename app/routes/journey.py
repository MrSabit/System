from flask import flash, redirect, url_for
from flask_login import current_user
from datetime import datetime
from app import db
from app.models.mission import Mission

@journey.route('/complete_mission/<int:id>', methods=['POST'])
def complete_mission(id):
    # Check if user is at least level 7
    if current_user.level < 7:
        return redirect(url_for('journey.missions'))
        
    mission = Mission.query.get_or_404(id)
    
    if mission.user_id != current_user.id:
        return redirect(url_for('journey.missions'))
    
    if mission.is_completed:
        return redirect(url_for('journey.missions'))
    
    # Mark mission as completed
    mission.is_completed = True
    mission.completed_at = datetime.utcnow()
    
    # Award XP with penalty if applicable
    actual_xp = current_user.add_xp(mission.xp_reward)
    
    # Check for level up
    required_xp = current_user.xp_to_next_level
    old_level = current_user.level
    if current_user.xp >= required_xp:
        current_user.level += 1
        current_user.xp -= required_xp
        db.session.commit()
    else:
        db.session.commit()
    
    # Redirect with animation parameters
    return redirect(url_for('journey.missions', 
                           mission_completed='true', 
                           xp=mission.xp_reward,
                           level=current_user.level))