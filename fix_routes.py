#!/usr/bin/env python
# Script to fix indentation issues in routes.py

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # Find and fix line 1826-1832 (topic function)
    for i in range(len(lines)):
        if "if topics_added > 0:" in lines[i] and "db.session.commit()" in lines[i+1]:
            # Fix indentation in this area
            lines[i+1] = "        db.session.commit()\n"
            
            # Find the "message =" line and fix its indentation
            for j in range(i+2, i+10):
                if "message = " in lines[j]:
                    lines[j] = "        message = \"\"\n"
                    break
            
            # Find the if/else for topics_skipped
            for j in range(i+3, i+15):
                if "if topics_skipped > 0:" in lines[j]:
                    lines[j] = "        if topics_skipped > 0:\n"
                    # Find matching else
                    for k in range(j+1, j+10):
                        if "else:" in lines[k].strip():
                            lines[k] = "        else:\n"
                            break
                    break
    
    # Find and fix line 1894-1900 (subtopic function)
    for i in range(len(lines)):
        if "if subtopics_added > 0:" in lines[i] and "db.session.commit()" in lines[i+1]:
            # Fix indentation in this area
            lines[i+1] = "        db.session.commit()\n"
            
            # Find the "message =" line and fix its indentation
            for j in range(i+2, i+10):
                if "message = " in lines[j]:
                    lines[j] = "        message = \"\"\n"
                    break
            
            # Find the if/else for subtopics_skipped
            for j in range(i+3, i+15):
                if "if subtopics_skipped > 0:" in lines[j]:
                    lines[j] = "        if subtopics_skipped > 0:\n"
                    # Find matching else
                    for k in range(j+1, j+10):
                        if "else:" in lines[k].strip():
                            lines[k] = "        else:\n"
                            break
                    break
    
    # Fix line 1950 - unexpected indentation in toggle_subtopic
    for i in range(len(lines)):
        if "# Commit the change immediately to ensure it's saved" in lines[i]:
            if i+1 < len(lines) and "db.session.commit()" in lines[i+1] and lines[i+1].startswith("        "):
                lines[i+1] = "    db.session.commit()\n"
    
    # Fix indentation in the get_study_hours function around line 2155
    view_block_start = None
    for i in range(len(lines)):
        if "def get_study_hours():" in lines[i]:
            view_block_start = i
            break
    
    if view_block_start:
        # Find the elif view == 'monthly': block
        for i in range(view_block_start, len(lines)):
            if "elif view == 'monthly':" in lines[i]:
                # Fix indentation of this block
                lines[i] = "    elif view == 'monthly':\n"
                # Fix indentation of next several lines
                for j in range(i+1, i+20):
                    if j < len(lines) and not lines[j].startswith("def ") and lines[j].strip():
                        current_indent = len(lines[j]) - len(lines[j].lstrip())
                        if current_indent > 8:  # If already properly indented, leave it
                            continue
                        # Add proper indentation
                        lines[j] = "        " + lines[j].lstrip()
            
            # Find the elif view == 'yearly': block
            if "elif view == 'yearly':" in lines[i]:
                # Fix indentation of this block
                lines[i] = "    elif view == 'yearly':\n"
                # Fix indentation of next several lines
                for j in range(i+1, i+20):
                    if j < len(lines) and not lines[j].startswith("def ") and lines[j].strip():
                        current_indent = len(lines[j]) - len(lines[j].lstrip())
                        if current_indent > 8:  # If already properly indented, leave it
                            continue
                        # Add proper indentation
                        lines[j] = "        " + lines[j].lstrip()
    
    # Save the fixed file
    with open(filename, 'w', encoding='utf-8') as file:
        file.writelines(lines)
    
    print(f"Fixed indentation issues in {filename}")

if __name__ == "__main__":
    fix_file("app/routes.py") 