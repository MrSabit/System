def calculate_xp_for_level(target_level):
    xp = 100  # Starting XP requirement (level 0 to 1)
    
    for level in range(1, target_level + 1):
        if level < 7:
            xp = 100 + 10 * level
        else:
            xp = int(xp * 1.5)
        
        print(f"Level {level} to {level+1}: {xp} XP")
    
    return xp

# Calculate XP required to reach level 68 from level 67
required_xp = calculate_xp_for_level(67)
print(f"\nRequired XP for level 67 to 68: {required_xp} XP") 