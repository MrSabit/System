# Small script to fix the routes.py file
with open('app/routes.py', 'r', encoding='utf-8') as file:
    lines = file.readlines()

# Find the get_study_hours function
start_line = -1
for i, line in enumerate(lines):
    if "def get_study_hours():" in line:
        start_line = i
        break

if start_line > 0:
    # Find the weekly if statement
    weekly_if_line = -1
    for i in range(start_line, len(lines)):
        if "if view == 'weekly':" in lines[i]:
            weekly_if_line = i
            break
    
    # Fix the return statement after weekly processing
    for i in range(weekly_if_line, len(lines)):
        if "return jsonify" in lines[i] and "'success': True" in lines[i]:
            # Assuming this is the return for weekly view
            # We need to check if it's properly indented
            indentation = len(lines[i]) - len(lines[i].lstrip())
            if indentation < 8:  # Should have at least 8 spaces
                lines[i] = "        " + lines[i].lstrip()  # Fix indentation
            
            # Also check the following lines for the closing bracket
            for j in range(i+1, i+5):
                if j < len(lines) and "}))" in lines[j]:
                    lines[j] = "        })\n"  # Fix closing
            break
    
    # Write the updated file
    with open('app/routes.py', 'w', encoding='utf-8') as file:
        file.writelines(lines)
    
    print("Routes file updated successfully.") 