from flask import Flask
from app import create_app, db
from app.models import User
from sqlalchemy import text
import argparse

def fix_level_xp():
    """Fix the XP to next level values for all users.
    
    Updates all users to use the new linear formula (100 + 10*level)
    regardless of their current level.
    """
    app = create_app()
    
    with app.app_context():
        # Get all users
        users = User.query.all()
        count = 0
        
        for user in users:
            # Calculate the correct XP based on the new linear formula
            correct_xp = 100 + 10 * user.level
            
            # If the current value is different, update it
            if user.xp_to_next_level != correct_xp:
                print(f"Fixing user {user.username} (ID: {user.id})")
                print(f"  Current level: {user.level}")
                print(f"  Current XP to next level: {user.xp_to_next_level}")
                print(f"  Corrected XP to next level: {correct_xp}")
                
                # Update the value
                user.xp_to_next_level = correct_xp
                count += 1
        
        # Commit the changes if any users were updated
        if count > 0:
            db.session.commit()
            print(f"Fixed XP requirements for {count} users.")
        else:
            print("No users needed fixing.")

def apply_excess_xp():
    """Process users with excess XP and level them up correctly.
    
    This function handles cases where a user has more XP than needed for their next level.
    It will automatically level them up multiple times if necessary, until their XP
    is properly distributed, using the new linear formula.
    """
    app = create_app()
    
    with app.app_context():
        # Get all users
        users = User.query.all()
        leveled_up_count = 0
        
        for user in users:
            original_level = user.level
            original_xp = user.xp
            
            print(f"Processing user {user.username} (ID: {user.id})")
            print(f"  Starting level: {user.level}")
            print(f"  Current XP: {user.xp}")
            print(f"  XP to next level: {user.xp_to_next_level}")
            
            # Check if user has more XP than needed for next level
            while user.xp >= user.xp_to_next_level:
                # Level up!
                excess_xp = user.xp - user.xp_to_next_level
                user.xp = excess_xp
                user.level += 1
                
                # Calculate new XP requirement for next level using the new linear formula
                user.xp_to_next_level = 100 + 10 * user.level
                
                print(f"  Leveled up to: {user.level}")
                print(f"  Remaining XP: {user.xp}")
                print(f"  New XP to next level: {user.xp_to_next_level}")
            
            # Check if the user's level changed
            if user.level > original_level:
                leveled_up_count += 1
                print(f"User {user.username} leveled up from {original_level} to {user.level}")
                print(f"  Original XP: {original_xp}")
                print(f"  Remaining XP: {user.xp}")
        
        # Commit the changes if any users were updated
        if leveled_up_count > 0:
            db.session.commit()
            print(f"Leveled up {leveled_up_count} users with excess XP.")
        else:
            print("No users needed leveling up.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fix XP and level values for all users")
    parser.add_argument(
        "--apply-excess-xp",
        action="store_true",
        help="Process users with excess XP and level them up correctly"
    )
    
    args = parser.parse_args()
    
    if args.apply_excess_xp:
        apply_excess_xp()
    else:
        fix_level_xp() 