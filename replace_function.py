import os

# Read the fixed function
with open('fixed_function.py', 'r', encoding='utf-8') as f:
    fixed_function = f.read()

# Read the routes.py file
with open('app/routes.py', 'r', encoding='utf-8') as f:
    routes_content = f.read()

# Find the start and end of the get_study_hours function
start_marker = "@bp.route('/api/study_hours', methods=['POST'])"
end_marker = "@bp.route('/api/add_skill', methods=['POST'])"

start_index = routes_content.find(start_marker)
end_index = routes_content.find(end_marker)

if start_index == -1 or end_index == -1:
    print("Could not find the function markers in routes.py")
    exit(1)

# Replace the function with the fixed version
new_content = routes_content[:start_index] + fixed_function + "\n\n" + routes_content[end_index:]

# Make a backup of the original file
backup_file = 'app/routes.py.bak'
if not os.path.exists(backup_file):
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(routes_content)
    print(f"Backup created at {backup_file}")

# Write the updated content
with open('app/routes.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully replaced the get_study_hours function in routes.py") 