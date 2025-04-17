// Daily Journal JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Journal script loaded');
    
    // Set today's date as default
    setDefaultDate();
    
    // Initialize the page
    loadJournalEntries();
    updateSelectedDate();
    
    // Add event listeners
    const dateInput = document.getElementById('journalDate');
    if (dateInput) {
        dateInput.addEventListener('change', updateSelectedDate);
    }
    
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveJournalEntry);
    }
});

// Set default date to today
function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    
    // Format to YYYY-MM-DD
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById('journalDate').value = formattedDate;
}

// Update the selected date display
function updateSelectedDate() {
    const dateInput = document.getElementById('journalDate');
    const selectedDateDisplay = document.getElementById('selectedDate');
    
    if (!dateInput || !selectedDateDisplay) {
        console.error('Date elements not found');
        return;
    }
    
    try {
        const date = new Date(dateInput.value);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        selectedDateDisplay.textContent = 'for ' + formattedDate;
        
        // Check if we have an entry for this date and load it
        loadEntryForDate(dateInput.value);
    } catch (e) {
        console.error('Error formatting date:', e);
    }
}

// Mood selection function
function selectMood(mood) {
    console.log('Selecting mood:', mood);
    // Remove selected class from all mood buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.classList.remove('mood-selected');
        btn.style.opacity = '0.7';
    });
    
    // Add selected class to clicked button
    const selectedButton = document.querySelector('.mood-' + mood);
    if (selectedButton) {
        selectedButton.classList.add('mood-selected');
        selectedButton.style.opacity = '1';
    } else {
        console.error('Mood button not found:', mood);
    }
    
    // Store the selected mood
    const moodInput = document.getElementById('moodInput');
    if (moodInput) {
        moodInput.value = mood;
    } else {
        console.error('Mood input element not found');
    }
}

// Save journal entry
function saveJournalEntry() {
    const entry = {
        date: document.getElementById('journalDate').value,
        title: document.getElementById('entryTitle').value,
        content: document.getElementById('entryContent').value,
        goals: document.getElementById('entryGoals').value,
        mood: document.getElementById('moodInput').value
    };
    
    // Validate
    if (!entry.title) {
        alert('Please enter a title for your journal entry');
        return;
    }
    
    if (!entry.mood) {
        alert('Please select your mood');
        return;
    }
    
    // Show loading state
    const saveButton = document.getElementById('saveButton');
    const originalText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    
    // Send to server
    fetch('/journal/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            alert('Journal entry saved successfully!');
            
            // Reload entries
            loadJournalEntries();
            
            // Clear form
            document.getElementById('entryTitle').value = '';
            document.getElementById('entryContent').value = '';
            document.getElementById('entryGoals').value = '';
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('mood-selected');
                btn.style.opacity = '1';
            });
            document.getElementById('moodInput').value = '';
        } else {
            alert('Error saving journal entry: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving journal entry:', error);
        alert('Failed to save journal entry. Please try again.');
    })
    .finally(() => {
        // Restore button
        saveButton.disabled = false;
        saveButton.textContent = originalText;
    });
}

// Load journal entries from server
function loadJournalEntries() {
    fetch('/journal/api/entries')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayEntries(data.entries);
            } else {
                console.error('Error loading journal entries:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching journal entries:', error);
        });
}

// Load a specific entry for a date
function loadEntryForDate(dateStr) {
    fetch(`/journal/api/entry?date=${dateStr}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.entry) {
                // Fill the form with the entry data
                document.getElementById('entryTitle').value = data.entry.title;
                document.getElementById('entryContent').value = data.entry.content;
                document.getElementById('entryGoals').value = data.entry.goals || '';
                document.getElementById('moodInput').value = data.entry.mood;
                
                // Select the mood button
                selectMood(data.entry.mood);
            } else {
                // Clear the form for a new entry
                document.getElementById('entryTitle').value = '';
                document.getElementById('entryContent').value = '';
                document.getElementById('entryGoals').value = '';
                document.getElementById('moodInput').value = '';
                document.querySelectorAll('.mood-btn').forEach(btn => {
                    btn.classList.remove('mood-selected');
                    btn.style.opacity = '0.7';
                });
            }
        })
        .catch(error => {
            console.error('Error fetching entry for date:', error);
        });
}

// Display entries in the list
function displayEntries(entries) {
    const entriesList = document.getElementById('entriesList');
    if (!entriesList) {
        console.error('Entries list element not found');
        return;
    }
    
    // Clear existing entries except for the first one which is a template
    const firstEntry = entriesList.querySelector('.entry-card');
    entriesList.innerHTML = '';
    
    // Add entries
    if (entries.length === 0) {
        // Add a message if no entries
        const noEntriesMessage = document.createElement('div');
        noEntriesMessage.className = 'text-center text-muted p-3';
        noEntriesMessage.textContent = 'No journal entries yet. Create your first entry!';
        entriesList.appendChild(noEntriesMessage);
        return;
    }
    
    entries.forEach(entry => {
        // Create a new entry element
        const entryElement = document.createElement('div');
        entryElement.className = 'list-group-item bg-dark text-white entry-card';
        
        // Get badge color based on mood
        let badgeClass = 'bg-secondary';
        if (entry.mood === 'amazing') badgeClass = 'bg-success';
        if (entry.mood === 'good') badgeClass = 'bg-primary';
        if (entry.mood === 'neutral') badgeClass = 'bg-secondary';
        if (entry.mood === 'bad') badgeClass = 'bg-danger';
        
        // Format date
        const dateObj = new Date(entry.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Set content with safe HTML
        entryElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-1">${entry.title}</h5>
                <small class="text-muted">${formattedDate}</small>
            </div>
            <p class="mb-1">${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}</p>
            <div>
                <span class="badge ${badgeClass}">${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</span>
            </div>
        `;
        
        // Add click event to load the entry
        entryElement.addEventListener('click', function() {
            document.getElementById('journalDate').value = entry.date;
            updateSelectedDate();
        });
        
        // Add to list
        entriesList.appendChild(entryElement);
    });
}
