// The Journal - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('The Journal script loaded');
    
    // Initialize variables
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = new Date();
    let notesData = {};
    let editor;
    let saveTimeout = null;
    
    // Initialize the calendar
    renderCalendar(currentMonth, currentYear);
    
    // Initialize CKEditor
    ClassicEditor
        .create(document.querySelector('#editor'), {
            toolbar: [
                'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|',
                'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
                'alignment', 'indent', 'outdent', '|',
                'highlight', 'specialCharacters', '|',
                'bulletedList', 'numberedList', 'blockQuote', '|',
                'insertTable', 'imageUpload', 'link', '|',
                'undo', 'redo'
            ],
            fontSize: {
                options: [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]
            },
            fontFamily: {
                options: ['default', 'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana']
            },
            alignment: {
                options: ['left', 'center', 'right', 'justify']
            },
            table: {
                contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
            },
            image: {
                toolbar: ['imageTextAlternative', 'imageStyle:full', 'imageStyle:side']
            },
            extraPlugins: [MyCustomUploadAdapterPlugin]
        })
        .then(newEditor => {
            editor = newEditor;
            
            // Set up auto-save for editor content changes
            editor.model.document.on('change:data', () => {
                triggerAutoSave();
            });
            
            // Load initial note for today
            loadNoteForDate(formatDateForAPI(selectedDate));
        })
        .catch(error => {
            console.error('Error initializing CKEditor:', error);
        });
    
    // Event listeners for calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        navigateMonth(-1);
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        navigateMonth(1);
    });
    
    // Event listener for note title changes
    document.getElementById('noteTitle').addEventListener('input', () => {
        triggerAutoSave();
    });
    
    // Event listeners for day navigation, read mode and export buttons
    document.getElementById('prevDayBtn').addEventListener('click', navigateToPreviousDay);
    document.getElementById('nextDayBtn').addEventListener('click', navigateToNextDay);
    document.getElementById('readModeBtn').addEventListener('click', toggleReadMode);
    document.getElementById('closeReadMode').addEventListener('click', closeReadMode);
    document.getElementById('readModePrevDay').addEventListener('click', readModeNavigateToPreviousDay);
    document.getElementById('readModeNextDay').addEventListener('click', readModeNavigateToNextDay);
    document.getElementById('exportPDF').addEventListener('click', exportAsPDF);
    document.getElementById('exportDOCX').addEventListener('click', exportAsDOCX);
    document.getElementById('prevPage').addEventListener('click', navigateToPrevPage);
    document.getElementById('nextPage').addEventListener('click', navigateToNextPage);
    
    // Function to render the calendar
    function renderCalendar(month, year) {
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('monthYearDisplay').textContent = `${monthNames[month]} ${year}`;
        
        // Get first day of the month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get previous month's last days
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        // Create calendar grid
        let dayCount = 1;
        let nextMonthDay = 1;
        
        // Load notes data for this month
        fetchMonthNotes(year, month);
        
        // Generate 6 weeks (42 days) to ensure a complete calendar
        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            
            // Previous month days
            if (i < firstDay) {
                const prevDay = prevMonthDays - firstDay + i + 1;
                dayElement.textContent = prevDay;
                dayElement.classList.add('other-month');
                calendarDays.appendChild(dayElement);
                continue;
            }
            
            // Current month days
            if (dayCount <= daysInMonth) {
                dayElement.textContent = dayCount;
                
                // Check if it's today
                const today = new Date();
                if (dayCount === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                
                // Check if it's selected date
                if (dayCount === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                    dayElement.classList.add('selected');
                }
                
                // Add click event
                const clickDate = new Date(year, month, dayCount);
                dayElement.addEventListener('click', () => selectDate(clickDate));
                
                // Check if day has a note
                const dateKey = formatDateForAPI(new Date(year, month, dayCount));
                if (notesData[dateKey]) {
                    dayElement.classList.add('has-note');
                }
                
                calendarDays.appendChild(dayElement);
                dayCount++;
            } 
            // Next month days
            else {
                dayElement.textContent = nextMonthDay;
                dayElement.classList.add('other-month');
                calendarDays.appendChild(dayElement);
                nextMonthDay++;
            }
        }
    }
    
    // Function to navigate between months
    function navigateMonth(direction) {
        currentMonth += direction;
        
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        
        renderCalendar(currentMonth, currentYear);
    }
    
    // Function to select a date
    function selectDate(date) {
        selectedDate = date;
        
        // Update calendar UI
        const allDays = document.querySelectorAll('.calendar-day');
        allDays.forEach(day => {
            day.classList.remove('selected');
            if (!day.classList.contains('other-month') && 
                parseInt(day.textContent) === date.getDate() && 
                currentMonth === date.getMonth() && 
                currentYear === date.getFullYear()) {
                day.classList.add('selected');
            }
        });
        
        // Update selected date display
        updateSelectedDateDisplay();
        
        // Update day navigation buttons
        updateDayNavigationButtons();
        
        // Load note for the selected date
        loadNoteForDate(formatDateForAPI(date));
    }
    
    // Function to update the selected date display
    function updateSelectedDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('selectedDate').textContent = selectedDate.toLocaleDateString('en-US', options);
    }
    
    // Function to navigate to the previous day
    function navigateToPreviousDay() {
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        
        // If we need to change month in the calendar view
        if (prevDay.getMonth() !== currentMonth || prevDay.getFullYear() !== currentYear) {
            currentMonth = prevDay.getMonth();
            currentYear = prevDay.getFullYear();
            renderCalendar(currentMonth, currentYear);
        }
        
        selectDate(prevDay);
        
        // Add animation effect
        addSlideAnimation('right');
    }
    
    // Function to navigate to the next day
    function navigateToNextDay() {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // If we need to change month in the calendar view
        if (nextDay.getMonth() !== currentMonth || nextDay.getFullYear() !== currentYear) {
            currentMonth = nextDay.getMonth();
            currentYear = nextDay.getFullYear();
            renderCalendar(currentMonth, currentYear);
        }
        
        selectDate(nextDay);
        
        // Add animation effect
        addSlideAnimation('left');
    }
    
    // Function to update day navigation buttons
    function updateDayNavigationButtons() {
        // Currently we don't disable any day navigation buttons
        // as users can navigate to any past or future date
        // But this function can be used if we want to add restrictions later
    }
    
    // Function to add slide animation when changing days
    function addSlideAnimation(direction) {
        const editorSection = document.querySelector('.editor-section');
        
        // Add animation class
        editorSection.classList.add(`slide-${direction}`);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            editorSection.classList.remove(`slide-${direction}`);
        }, 500);
    }
    
    // Read mode day navigation functions
    function readModeNavigateToPreviousDay() {
        // Calculate previous day
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        
        // Add transition effect
        addReadModeTransition('right');
        
        // Load the previous day's content directly in read mode
        loadDayInReadMode(prevDay);
    }
    
    function readModeNavigateToNextDay() {
        // Calculate next day
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Add transition effect
        addReadModeTransition('left');
        
        // Load the next day's content directly in read mode
        loadDayInReadMode(nextDay);
    }
    
    // Function to load a specific day's content directly in read mode
    function loadDayInReadMode(date) {
        // Update the selected date (this will be used when exiting read mode)
        selectedDate = date;
        
        // Update calendar if needed (for when we exit read mode)
        if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
            currentMonth = date.getMonth();
            currentYear = date.getFullYear();
            renderCalendar(currentMonth, currentYear);
        }
        
        // Format date for display
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Update the date display in read mode
        document.getElementById('readModeDate').textContent = formattedDate;
        
        // Fetch the note for this date
        fetch(`/journal/api/note?date=${formatDateForAPI(date)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the title
                    const noteTitle = data.note.title || 'Untitled Note';
                    document.getElementById('readModeTitle').textContent = noteTitle;
                    
                    // Process content into pages
                    processContentIntoPages(data.note.content || '');
                    
                    // Show the first page
                    showPage(1);
                } else {
                    // If no note exists for this date, show empty state
                    document.getElementById('readModeTitle').textContent = 'No Entry';
                    processContentIntoPages('<p>No journal entry for this date.</p>');
                    showPage(1);
                }
            })
            .catch(error => {
                console.error('Error fetching note:', error);
                document.getElementById('readModeTitle').textContent = 'Error';
                processContentIntoPages('<p>Error loading journal entry.</p>');
                showPage(1);
            });
    }
    
    // Function to add transition effect when changing days in read mode
    function addReadModeTransition(direction) {
        const contentElement = document.getElementById('readModeContent');
        const titleElement = document.getElementById('readModeTitle');
        const dateElement = document.getElementById('readModeDate');
        
        // Add transition classes
        contentElement.classList.add(`slide-out-${direction}`);
        titleElement.classList.add('fade-out');
        dateElement.classList.add('fade-out');
        
        // Remove transition classes after animation completes
        setTimeout(() => {
            contentElement.classList.remove(`slide-out-${direction}`);
            contentElement.classList.add(`slide-in-${direction === 'left' ? 'right' : 'left'}`);
            titleElement.classList.remove('fade-out');
            titleElement.classList.add('fade-in');
            dateElement.classList.remove('fade-out');
            dateElement.classList.add('fade-in');
            
            // Remove the incoming animation classes after they complete
            setTimeout(() => {
                contentElement.classList.remove(`slide-in-${direction === 'left' ? 'right' : 'left'}`);
                titleElement.classList.remove('fade-in');
                dateElement.classList.remove('fade-in');
            }, 500);
        }, 300);
    }
    
    // Handle keyboard navigation for read mode
    function handleReadModeKeyPress(event) {
        // Only process if read mode is active
        const overlay = document.getElementById('readModeOverlay');
        if (overlay.style.display !== 'flex' || !overlay.classList.contains('active')) {
            return;
        }
        
        switch(event.key) {
            case 'Escape':
                closeReadMode();
                break;
            case 'ArrowLeft':
                // Previous day
                readModeNavigateToPreviousDay();
                break;
            case 'ArrowRight':
                // Next day
                readModeNavigateToNextDay();
                break;
            case 'ArrowUp':
                // Previous page (if pagination is active)
                if (currentPage > 1) {
                    navigateToPrevPage();
                }
                break;
            case 'ArrowDown':
                // Next page (if pagination is active)
                if (currentPage < readModeContent.length) {
                    navigateToNextPage();
                }
                break;
        }
    }
    
    // Format date for API calls (YYYY-MM-DD)
    function formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Function to fetch notes for the entire month
    function fetchMonthNotes(year, month) {
        fetch('/journal/api/notes-by-month?year=' + year + '&month=' + (month + 1))
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the notesData object
                    notesData = {};
                    data.notes.forEach(note => {
                        notesData[note.date] = note;
                    });
                    
                    // Update calendar to show which days have notes
                    updateCalendarNoteIndicators();
                }
            })
            .catch(error => {
                console.error('Error fetching month notes:', error);
            });
    }
    
    // Update calendar to show which days have notes
    function updateCalendarNoteIndicators() {
        const calendarDays = document.querySelectorAll('.calendar-day:not(.other-month)');
        
        calendarDays.forEach(dayElement => {
            const day = parseInt(dayElement.textContent);
            const dateKey = formatDateForAPI(new Date(currentYear, currentMonth, day));
            
            if (notesData[dateKey]) {
                dayElement.classList.add('has-note');
            } else {
                dayElement.classList.remove('has-note');
            }
        });
    }
    
    // Function to load a note for a specific date
    function loadNoteForDate(dateStr) {
        fetch('/journal/api/note?date=' + dateStr)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const note = data.note;
                    
                    if (note) {
                        // Fill the editor with note data
                        document.getElementById('noteTitle').value = note.title;
                        editor.setData(note.content);
                    } else {
                        // Clear the editor for a new note
                        document.getElementById('noteTitle').value = '';
                        editor.setData('<p></p>');
                    }
                }
            })
            .catch(error => {
                console.error('Error loading note:', error);
            });
    }
    
    // Trigger auto-save with debounce
    function triggerAutoSave() {
        // Update save status indicator
        document.getElementById('saveStatus').innerHTML = '<span style="color: #f9a825;">Saving...</span>';
        
        // Clear previous timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        // Set new timeout (1 second delay)
        saveTimeout = setTimeout(() => {
            saveNote();
        }, 1000);
    }
    
    // Function to save the current note
    function saveNote() {
        const noteData = {
            date: formatDateForAPI(selectedDate),
            title: document.getElementById('noteTitle').value.trim() || 'Untitled Note',
            content: editor.getData()
        };
        
        fetch('/journal/api/save-note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update save status
                document.getElementById('saveStatus').innerHTML = '<span>Auto-saved at ' + 
                    new Date().toLocaleTimeString() + '</span>';
                
                // Update the notes data and refresh calendar indicators
                notesData[noteData.date] = { 
                    date: noteData.date,
                    title: noteData.title,
                    content: noteData.content
                };
                updateCalendarNoteIndicators();
            } else {
                document.getElementById('saveStatus').innerHTML = 
                    '<span style="color: #e53e3e;">Error saving</span>';
            }
        })
        .catch(error => {
            console.error('Error saving note:', error);
            document.getElementById('saveStatus').innerHTML = 
                '<span style="color: #e53e3e;">Error saving</span>';
        });
    }
    
    // Export as PDF
    function exportAsPDF() {
        const noteTitle = document.getElementById('noteTitle').value.trim() || 'Untitled Note';
        const noteContent = editor.getData();
        const dateStr = formatDateForAPI(selectedDate);
        
        // Create form data
        const formData = new FormData();
        formData.append('title', noteTitle);
        formData.append('content', noteContent);
        formData.append('date', dateStr);
        
        // Send request to server
        fetch('/journal/api/export-pdf', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) return response.blob();
            throw new Error('Network response was not ok.');
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Journal_${dateStr}_${noteTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error exporting PDF:', error);
            alert('Failed to export as PDF. Please try again.');
        });
    }
    
    // Export as DOCX
    function exportAsDOCX() {
        const noteTitle = document.getElementById('noteTitle').value.trim() || 'Untitled Note';
        const noteContent = editor.getData();
        const dateStr = formatDateForAPI(selectedDate);
        
        // Create form data
        const formData = new FormData();
        formData.append('title', noteTitle);
        formData.append('content', noteContent);
        formData.append('date', dateStr);
        
        // Send request to server
        fetch('/journal/api/export-docx', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) return response.blob();
            throw new Error('Network response was not ok.');
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Journal_${dateStr}_${noteTitle.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error exporting DOCX:', error);
            alert('Failed to export as DOCX. Please try again.');
        });
    }
    
    // Read Mode Variables
    let currentReadPage = 1;
    let totalReadPages = 1;
    let readModeContent = [];
    
    // Toggle Read Mode
    function toggleReadMode() {
        const noteTitle = document.getElementById('noteTitle').value.trim() || 'Untitled Note';
        const noteContent = editor.getData();
        const dateStr = formatDateForAPI(selectedDate);
        const formattedDate = selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Set the read mode title and date
        document.getElementById('readModeTitle').textContent = noteTitle;
        document.getElementById('readModeDate').textContent = formattedDate;
        
        // Process content into pages
        processContentIntoPages(noteContent);
        
        // Show the first page
        showPage(1);
        
        // Show the read mode overlay with animation
        const overlay = document.getElementById('readModeOverlay');
        overlay.style.display = 'flex';
        
        // Trigger reflow for animation
        void overlay.offsetWidth;
        
        // Add active class to start animations
        overlay.classList.add('active');
        
        // Add ambient particles
        createAmbientParticles();
        
        // Add keyboard event listener for read mode
        document.addEventListener('keydown', handleReadModeKeyPress);
    }
    
    // Close read mode
    function closeReadMode() {
        const overlay = document.getElementById('readModeOverlay');
        overlay.classList.remove('active');
        
        // Remove overlay after animation completes
        setTimeout(() => {
            overlay.style.display = 'none';
            // Remove any ambient particles
            const particles = document.querySelectorAll('.ambient-particle');
            particles.forEach(particle => particle.remove());
            
            // Remove keyboard event listener when closing read mode
            document.removeEventListener('keydown', handleReadModeKeyPress);
        }, 500);
    }
    
    // Process content into pages for read mode
    function processContentIntoPages(content) {
        // Reset content array
        readModeContent = [];
        
        // Simple splitting by paragraphs for demonstration
        // In a real app, you might want more sophisticated pagination
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, table');
        
        // Group elements into pages (roughly 5 elements per page)
        let pageContent = document.createElement('div');
        let elementCount = 0;
        const elementsPerPage = 5;
        
        paragraphs.forEach(element => {
            const clone = element.cloneNode(true);
            pageContent.appendChild(clone);
            elementCount++;
            
            // Start a new page after elementsPerPage elements
            if (elementCount >= elementsPerPage) {
                readModeContent.push(pageContent.innerHTML);
                pageContent = document.createElement('div');
                elementCount = 0;
            }
        });
        
        // Add the last page if it has content
        if (elementCount > 0) {
            readModeContent.push(pageContent.innerHTML);
        }
        
        // If no content, create a default page
        if (readModeContent.length === 0) {
            readModeContent.push('<p>No content available for this note.</p>');
        }
        
        // Update total pages
        totalReadPages = readModeContent.length;
        document.getElementById('totalPages').textContent = totalReadPages;
        
        // Update navigation buttons
        updateNavigationButtons();
    }
    
    // Show a specific page in read mode
    function showPage(pageNum) {
        if (pageNum < 1 || pageNum > totalReadPages) return;
        
        currentReadPage = pageNum;
        
        // Update content
        const contentContainer = document.getElementById('readModeContent');
        
        // Create a new div for the page with animation
        const newPage = document.createElement('div');
        newPage.className = 'read-page';
        newPage.innerHTML = readModeContent[pageNum - 1];
        
        // Clear existing content with fade out animation
        const existingPages = contentContainer.querySelectorAll('.read-page');
        if (existingPages.length > 0) {
            existingPages.forEach(page => {
                page.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => page.remove(), 300);
            });
            
            // Add new page after short delay
            setTimeout(() => {
                contentContainer.appendChild(newPage);
                void newPage.offsetWidth; // Trigger reflow
                newPage.style.animation = 'fadeIn 0.5s forwards';
            }, 300);
        } else {
            contentContainer.appendChild(newPage);
            void newPage.offsetWidth; // Trigger reflow
            newPage.style.animation = 'fadeIn 0.5s forwards';
        }
        
        // Update page indicator
        document.getElementById('currentPage').textContent = currentReadPage;
        
        // Update navigation buttons
        updateNavigationButtons();
    }
    
    // Navigate to previous page
    function navigateToPrevPage() {
        if (currentReadPage > 1) {
            showPage(currentReadPage - 1);
        }
    }
    
    // Navigate to next page
    function navigateToNextPage() {
        if (currentReadPage < totalReadPages) {
            showPage(currentReadPage + 1);
        }
    }
    
    // Update navigation buttons based on current page
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        prevBtn.disabled = currentReadPage <= 1;
        nextBtn.disabled = currentReadPage >= totalReadPages;
    }
    
    // Create ambient floating particles for read mode
    function createAmbientParticles() {
        const container = document.querySelector('.read-mode-container');
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'ambient-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: rgba(66, 153, 225, ${Math.random() * 0.2 + 0.1});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                pointer-events: none;
                z-index: -1;
                animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
            `;
            
            // Create keyframes for this particle
            const keyframes = `
                @keyframes floatParticle {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                        opacity: ${Math.random() * 0.5 + 0.2};
                    }
                    25% {
                        opacity: ${Math.random() * 0.3 + 0.1};
                    }
                    50% {
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                        opacity: ${Math.random() * 0.5 + 0.2};
                    }
                    75% {
                        opacity: ${Math.random() * 0.3 + 0.1};
                    }
                    100% {
                        transform: translate(0, 0) rotate(360deg);
                        opacity: ${Math.random() * 0.5 + 0.2};
                    }
                }
            `;
            
            // Add keyframes to document
            const style = document.createElement('style');
            style.innerHTML = keyframes;
            document.head.appendChild(style);
            
            container.appendChild(particle);
        }
    }
    
    // Custom File Upload Adapter (Base64 Image Upload)
    function MyCustomUploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return {
                upload: () => {
                    return loader.file
                        .then(file => {
                            return new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.readAsDataURL(file);
                                reader.onload = () => resolve({ default: reader.result });
                                reader.onerror = error => reject(error);
                            });
                        });
                }
            };
        };
    }
    
    // Initialize the page
    updateSelectedDateDisplay();
    updateDayNavigationButtons();
});
