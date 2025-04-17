def calculate_xp_for_level(target_level):
    """Calculate XP required for each level using the new linear formula
    XP required = 100 + 10 * level
    """
    xp_values = []
    
    # Calculate XP for each level
    for level in range(0, target_level + 1):
        xp = 100 + 10 * level
        xp_values.append(xp)
        print(f"Level {level} to {level+1}: {xp} XP")
    
    return xp_values[-1]  # Return XP required for the target level

# Calculate XP required to reach level 68 from level 67
required_xp = calculate_xp_for_level(67)
print(f"\nRequired XP for level 67 to 68: {required_xp} XP")

# Calculate total XP required to reach level 68 from level 0
total_xp = sum([100 + 10 * level for level in range(0, 68)])
print(f"Total XP required to reach level 68 from level 0: {total_xp} XP") 