// Notification System for The Journey
class JourneyNotification {
    constructor() {
        // Check if browser supports notifications
        this.notificationSupported = 'Notification' in window;
        this.permission = this.notificationSupported ? Notification.permission : 'denied';
        
        // Animation duration for toast notifications
        this.animationDuration = 400; // ms
        this.displayDuration = 5000; // ms
        
        // Initialize notification container
        this.initContainer();
        
        // Track notifications
        this.activeNotifications = [];
        this.processedIds = new Set(); // Track already processed notification IDs
        
        // Track last notification title for sound selection
        this.lastTitle = null;
        
        // Check for settings
        this.loadSettings();
        
        // Generate a unique page load ID to avoid duplicate notifications
        this.pageLoadId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    // Initialize notification container
    initContainer() {
        // Create container if it doesn't exist
        if (!document.getElementById('journey-notifications')) {
            const container = document.createElement('div');
            container.id = 'journey-notifications';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '2147483647'; // Maximum z-index
            container.style.pointerEvents = 'none';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'flex-end';
            container.style.justifyContent = 'flex-start';
            container.style.padding = '10px';
            container.style.boxSizing = 'border-box';
            document.body.appendChild(container);
        }
        this.container = document.getElementById('journey-notifications');
    }
    
    // Load notification settings
    loadSettings() {
        // User notification preferences
        this.settings = {
            enableBrowserNotifications: true,
            enableToastNotifications: true,
            enableAnimations: true,
            enableSound: true,
            soundVolume: 0.3
        };
        
        // Try to load from localStorage if available
        try {
            const savedSettings = JSON.parse(localStorage.getItem('journey_notification_settings'));
            if (savedSettings) {
                this.settings = {...this.settings, ...savedSettings};
            }
        } catch (e) {
            console.error('Error loading notification settings', e);
        }
    }
    
    // Save notification settings
    saveSettings(settings) {
        this.settings = {...this.settings, ...settings};
        localStorage.setItem('journey_notification_settings', JSON.stringify(this.settings));
    }
    
    // Request permission for browser notifications
    async requestPermission() {
        if (!this.notificationSupported) return false;
        
        if (this.permission !== 'granted') {
            try {
                this.permission = await Notification.requestPermission();
                return this.permission === 'granted';
            } catch (e) {
                console.error('Error requesting notification permission', e);
                return false;
            }
        }
        return true;
    }
    
    // Send a notification
    async notify({title, message, type = 'info', icon = null, duration = null, data = null, id = null, level_up = false}) {
        // Generate a unique ID for this notification if not provided
        const notificationId = id || `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        // Check if this notification has already been processed
        if (this.processedIds.has(notificationId)) {
            console.log('Notification already processed, skipping:', notificationId);
            return;
        }
        
        // Add to processed IDs
        this.processedIds.add(notificationId);
        
        // Store the title for use in sound selection
        this.lastTitle = title;
        
        // Create toast notification
        if (this.settings.enableToastNotifications) {
            this.createToast(message, type, duration || this.displayDuration, level_up);
        }
        
        // Send browser notification if enabled and permission granted AND page is not visible
        // Only show browser notifications when user is not actively viewing this tab
        if (this.settings.enableBrowserNotifications && this.notificationSupported && document.visibilityState !== 'visible') {
            // Request permission if not granted
            if (this.permission !== 'granted') {
                const granted = await this.requestPermission();
                if (!granted) return;
            }
            
            // Create notification
            const notification = new Notification(title || 'The Journey', {
                body: message,
                icon: icon || '/static/images/favicon.png',
                badge: '/static/images/badge.png',
                vibrate: level_up ? [500, 200, 500, 200, 500] : [200, 100, 200],
                data: {...(data || {}), id: notificationId}
            });
            
            // Add to active notifications
            this.activeNotifications.push(notification);
            
            // Remove from active notifications when closed
            notification.onclose = () => {
                this.activeNotifications = this.activeNotifications.filter(n => n !== notification);
            };
            
            // Close after duration
            setTimeout(() => notification.close(), duration || this.displayDuration);
            
            // Play sound if enabled
            if (this.settings.enableSound) {
                this.playNotificationSound(type, level_up);
            }
        }
    }
    
    // Create a toast notification
    createToast(message, type = 'info', duration = 5000, level_up = false) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `journey-toast journey-toast-${type}`;
        
        // Add level-up specific classes and animations
        if (level_up) {
            toast.classList.add('level-up-toast');
            toast.classList.add('animate-level-up');
        }
        
        // Add animation class if enabled
        if (this.settings.enableAnimations) {
            toast.classList.add('animate-in');
        }
        
        // Add message
        toast.textContent = message;
        
        // Add to notification container
        if (!this.container) {
            this.initContainer();
        }
        
        // Add to container
        this.container.appendChild(toast);
        
        // Remove after duration
        setTimeout(() => {
            if (this.settings.enableAnimations) {
                toast.classList.remove('animate-in');
                toast.classList.add('animate-out');
                
                // Wait for animation to complete before removing
                setTimeout(() => {
                    toast.remove();
                }, 300); // Match animation duration
            } else {
                toast.remove();
            }
        }, duration || this.displayDuration);
    }
    
    // Play notification sound
    playNotificationSound(type = 'info', level_up = false) {
        if (!this.settings.enableSound) return;
        
        // Special sound for level-ups
        if (level_up) {
            const levelUpSound = new Audio('/static/sounds/levelup.mp3');
            levelUpSound.volume = this.settings.soundVolume;
            levelUpSound.play();
        } else {
            // Regular notification sounds
            const sound = new Audio(`/static/sounds/${type}.mp3`);
            sound.volume = this.settings.soundVolume;
            sound.play();
        }
    }
    
    // Clear all notifications
    clearAll() {
        // Close browser notifications
        this.activeNotifications.forEach(notification => {
            notification.close();
        });
        this.activeNotifications = [];
        
        // Remove toast notifications
        const toasts = this.container.querySelectorAll('.journey-toast');
        toasts.forEach(toast => {
            this.dismissToast(toast);
        });
    }
    
    // Process flash messages on page load
    processFlashMessages() {
        const flashMessages = document.querySelectorAll('.flash-message');
        if (flashMessages.length) {
            flashMessages.forEach(message => {
                // Get message type
                let type = 'info';
                if (message.classList.contains('flash-success')) {
                    type = 'success';
                } else if (message.classList.contains('flash-error')) {
                    type = 'error';
                } else if (message.classList.contains('flash-warning')) {
                    type = 'warning';
                }
                
                // Get message text
                const text = message.textContent.trim();
                
                // Send notification
                this.notify({
                    title: 'The Journey',
                    message: text,
                    type: type,
                    id: `flash-${text.substring(0, 20)}`  // Create ID from text
                });
                
                // Remove flash message from DOM to prevent duplicate display
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            });
        }
    }
}

// Variable to track if we're currently checking for notifications
let checkingNotifications = false;

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to check for server-side notifications
function checkServerNotifications() {
    // Prevent multiple simultaneous checks
    if (checkingNotifications) {
        console.log('Already checking for notifications, skipping');
        return;
    }
    
    console.log('Checking for server notifications...');
    checkingNotifications = true;
    
    // If this page loaded within the last 500ms, add a slight delay to avoid duplicate notifications
    const pageLoadTime = window.performance && window.performance.timing 
        ? window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart
        : 0;
        
    if (pageLoadTime < 500) {
        console.log('Page just loaded, delaying notification check');
        setTimeout(performNotificationCheck, 1000);
    } else {
        performNotificationCheck();
    }
}

// Separate function to perform the actual notification check
function performNotificationCheck() {
    // Check if we have a notifications endpoint
    fetch('/api/get_notifications')
        .then(response => response.json())
        .then(data => {
            console.log('Notifications received:', data);
            if (data.notifications && data.notifications.length > 0) {
                // Process each notification with a slight delay between them
                data.notifications.forEach((notification, index) => {
                    // Generate a consistent ID for this notification to avoid duplicates
                    const notificationId = notification.title + '-' + notification.message.substring(0, 15);
                    
                    setTimeout(() => {
                        if (window.journeyNotification) {
                            console.log('Displaying notification:', notification);
                            window.journeyNotification.notify({
                                title: notification.title,
                                message: notification.message,
                                type: notification.type,
                                id: notificationId
                            });
                        }
                    }, index * 500); // 500ms delay between notifications
                });
            }
        })
        .catch(error => {
            console.error('Error checking for server notifications:', error);
        })
        .finally(() => {
            // Reset checking flag
            checkingNotifications = false;
        });
}

// Debounced version of checkServerNotifications to prevent rapid repeated calls
const debouncedCheckNotifications = debounce(checkServerNotifications, 1000);

// Add event listener to run notifications check after page loads/transitions
document.addEventListener('DOMContentLoaded', () => {
    // Create global notification instance if it doesn't exist yet
    if (!window.journeyNotification) {
        window.journeyNotification = new JourneyNotification();
    }
    
    // Process any flash messages on page load
    window.journeyNotification.processFlashMessages();
    
    // Check for server notifications (debounced)
    debouncedCheckNotifications();
});

// Also check for notifications when redirected - but debounced
if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_NAVIGATE) {
    debouncedCheckNotifications();
}