document.addEventListener('DOMContentLoaded', () => {
    console.log('Fantasy Dashboard loaded!');
    
    // Create raindrops
    const rainContainer = document.getElementById('rainContainer');
    if (rainContainer) {
        const numberOfDrops = 50;

        for (let i = 0; i < numberOfDrops; i++) {
            createRaindrop();
        }
    }

    function createRaindrop() {
        const drop = document.createElement('div');
        drop.classList.add('raindrop');
        
        // Random positioning and animation
        const leftPos = Math.random() * 100;
        const duration = Math.random() * 3 + 2; // 2-5 seconds
        const delay = Math.random() * 5;
        
        drop.style.left = `${leftPos}%`;
        drop.style.animationDuration = `${duration}s`;
        drop.style.animationDelay = `${delay}s`;
        
        rainContainer.appendChild(drop);
    }

    // Animate progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progressValue = progressBar.getAttribute('data-progress') || '40';
        setTimeout(() => {
            progressBar.style.width = `${progressValue}%`;
        }, 500);
    }

    // Navigation menu interaction
    const menuLinks = document.querySelectorAll('.menu-link');
    
    // Audio elements for sound effects
    const hoverSound = new Audio('/static/audio/click.mp3');
    
    // Set volume levels
    hoverSound.volume = 0.3;
    
    // Create a session storage value to prevent sounds on page load
    // Only play sounds when navigating within the site, not on initial/refresh load
    const isInitialPageLoad = sessionStorage.getItem('hasVisited') !== 'true';
    sessionStorage.setItem('hasVisited', 'true');
    
    // Preload the audio files but don't play on page load
    hoverSound.load();
    
    // Flag to track if sounds are ready to play
    let areSoundsReady = false;
    
    // Flag to prevent duplicate click sounds
    let clickSoundPlaying = false;
    
    // Timestamp to track when a click sound was last played
    let lastClickTime = 0;
    
    // Initialize audio on page load and first interaction
    initializeAudio();
    
    // Audio initializer button
    const audioInit = document.getElementById('audio-initializer');
    if (audioInit) {
        audioInit.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent this click from propagating
            initializeAudio();
        });
    }
    
    function initializeAudio() {
        // Check if context is needed for some browsers
        try {
            // Create a temporary audio context to unblock audio
            const tempContext = new (window.AudioContext || window.webkitAudioContext)();
            if (tempContext.state === 'suspended') {
                tempContext.resume().then(() => {
                    console.log('Audio context resumed');
                    areSoundsReady = true;
                });
            } else {
                areSoundsReady = true;
            }
            
            // Try to play a silent sound to unlock audio on iOS without audible effect
            const silentSound = new Audio("data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADgnABGiAAQBCqgCRMAAgEAH///////////////7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq//////////////////9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==");
            silentSound.volume = 0.001; // Almost silent
            silentSound.play().catch(() => {});
            
            // Check sound loading status
            Promise.all([
                new Promise(resolve => {
                    if (hoverSound.readyState >= 2) resolve();
                    else hoverSound.addEventListener('canplaythrough', resolve, {once: true});
                })
            ]).then(() => {
                console.log('Sound files loaded successfully');
                areSoundsReady = true;
            }).catch(error => {
                console.error('Error loading sound files:', error);
            });
            
        } catch (e) {
            console.log('Audio initialization deferred:', e);
        }
    }
    
    // Function to play hover sound
    function playHoverSound() {
        if (!areSoundsReady || isInitialPageLoad) return;
        
        try {
            // Reset and play the hover sound
            hoverSound.currentTime = 0;
            hoverSound.play().catch(error => {
                console.error('Error playing hover sound:', error);
            });
        } catch (error) {
            console.error('Error in hover sound playback:', error);
        }
    }
    
    // Function to play click sound with better debounce using timestamp
    function playClickSound() {
        // Disabled - no sound on click
        return;
    }
    
    // Initialize audio on first user interaction if not already initialized
    document.addEventListener('click', initializeAudio, {once: true});
    document.addEventListener('mousemove', initializeAudio, {once: true});
    
    // Add event listeners only after a short delay to prevent firing during page load
    setTimeout(() => {
        // Add hover sound to menu links
        menuLinks.forEach(link => {
            link.addEventListener('mouseenter', playHoverSound);
        });
        
        // Use event delegation for click sounds to avoid duplicates
        document.addEventListener('click', (event) => {
            // Click sounds disabled
            return;
        });
    }, 500); // Wait 500ms before attaching click listeners

    // Flash message fade out
    const flashMessages = document.querySelectorAll('.flash-message');
    if (flashMessages.length) {
        flashMessages.forEach(message => {
            setTimeout(() => {
                message.style.opacity = '0';
                message.style.transition = 'opacity 0.5s ease-in-out';
                setTimeout(() => {
                    message.remove();
                }, 500);
            }, 5000);
        });
    }
    
    // Quest item animation
    const questItems = document.querySelectorAll('.quest-item');
    if (questItems.length) {
        questItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Objective Box Interactive Effects
    const objectiveContainer = document.querySelector('.objective-container');
    const objectiveText = document.querySelector('.objective-text');
    
    if (objectiveContainer && objectiveText) {
        // Set data-text attribute for glitch effect
        objectiveText.setAttribute('data-text', objectiveText.textContent);
        
        // Create particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            objectiveContainer.appendChild(particle);
            
            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Random animation
            particle.style.animation = `float ${2 + Math.random() * 3}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 2 + 's';
        }
        
        // 3D Tilt Effect
        objectiveContainer.addEventListener('mousemove', (e) => {
            const rect = objectiveContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = (y - centerY) / 20;
            const tiltY = (centerX - x) / 20;
            
            objectiveContainer.style.setProperty('--tiltX', `${tiltX}deg`);
            objectiveContainer.style.setProperty('--tiltY', `${tiltY}deg`);
            objectiveContainer.classList.add('tilt');
        });
        
        objectiveContainer.addEventListener('mouseleave', () => {
            objectiveContainer.classList.remove('tilt');
            objectiveContainer.style.setProperty('--tiltX', '0deg');
            objectiveContainer.style.setProperty('--tiltY', '0deg');
        });
        
        // Random glitch effect
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every 2 seconds
                objectiveText.style.animation = 'textScramble 0.5s ease-in-out';
                setTimeout(() => {
                    objectiveText.style.animation = '';
                }, 500);
            }
        }, 2000);
    }

    // Add this code at the end of the file to enhance the menu with special effects
    enhanceHexagonalMenu();
    setupMenuSounds();
});

/**
 * Enhances the menu with responsive animations and effects
 */
function enhanceHexagonalMenu() {
    const menuItems = document.querySelectorAll('.nav-item');
    const menuLinks = document.querySelectorAll('.menu-link');
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    // Create CSS for the animation if it doesn't exist yet
    if (!document.querySelector('#menu-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'menu-animations';
        styleSheet.textContent = `
            @keyframes floatMenu {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(1deg); }
            }
            
            @keyframes menuPulse {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3); }
            }
            
            @keyframes menuClick {
                0% { transform: scale(1); }
                50% { transform: scale(0.92); }
                100% { transform: scale(1); }
            }
            
            .menu-pulse {
                animation: menuPulse 2s ease-in-out infinite !important;
            }
            
            .menu-click {
                animation: menuClick 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
            }
            
            .menu-tablet-hover {
                background: rgba(65, 105, 225, 0.1) !important;
            }
            
            .menu-mobile-hover {
                background: rgba(65, 105, 225, 0.05) !important;
            }
            
            .menu-mobile-hover span {
                padding-left: 15px !important;
                color: #64a5ff !important;
            }
            
            .menu-mobile-hover span::before {
                opacity: 1 !important;
                transform: translateX(3px) !important;
            }
            
            @media (max-width: 768px) {
                .menu-click {
                    animation: menuClick 0.2s ease forwards !important;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Apply appropriate animations based on screen size
    if (!isMobile) {
        // Desktop animations - staggered floating
        menuItems.forEach((item, index) => {
            const delay = index * 0.2;
            const duration = 3 + Math.random() * 2;
            item.style.animation = `floatMenu ${duration}s ease-in-out ${delay}s infinite`;
        });
        
        // Add mousemove parallax effect for desktop only
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            document.addEventListener('mousemove', (e) => {
                // Calculate mouse position relative to the center of the screen
                const mouseX = e.clientX / window.innerWidth - 0.5;
                const mouseY = e.clientY / window.innerHeight - 0.5;
                
                // Apply subtle rotation to menu items based on mouse position
                menuItems.forEach(item => {
                    const itemRect = item.getBoundingClientRect();
                    const itemCenterX = itemRect.left + itemRect.width / 2;
                    const itemCenterY = itemRect.top + itemRect.height / 2;
                    
                    // Calculate distance from mouse to this item (normalized)
                    const distX = (e.clientX - itemCenterX) / window.innerWidth;
                    const distY = (e.clientY - itemCenterY) / window.innerHeight;
                    const dist = Math.sqrt(distX * distX + distY * distY);
                    
                    // Apply transform based on mouse distance and position
                    item.style.transform = `
                        translateX(${-mouseX * 15 * (1 - dist)}px) 
                        translateY(${-mouseY * 15 * (1 - dist)}px)
                        rotateX(${mouseY * 10}deg)
                        rotateY(${-mouseX * 10}deg)
                    `;
                });
            });
        }
    }
    
    // Add appropriate hover/click effects based on screen size
    menuLinks.forEach(link => {
        const navItem = link.querySelector('.nav-item');
        
        // Click effects for all devices
        link.addEventListener('click', function(e) {
            // Don't add the effect if it's already the active item
            if (!navItem.classList.contains('active')) {
                navItem.classList.add('menu-click');
                
                // Remove the class after animation completes
                setTimeout(() => {
                    navItem.classList.remove('menu-click');
                }, 300);
            }
        });
        
        if (!isMobile) {
            // Desktop hover effects
            link.addEventListener('mouseenter', function() {
                navItem.classList.add('menu-pulse');
            });
            
            link.addEventListener('mouseleave', function() {
                navItem.classList.remove('menu-pulse');
            });
        } else if (!isSmallMobile) {
            // Tablet hover effects
            link.addEventListener('mouseenter', function() {
                link.classList.add('menu-tablet-hover');
            });
            
            link.addEventListener('mouseleave', function() {
                link.classList.remove('menu-tablet-hover');
            });
        } else {
            // Mobile hover effects
            link.addEventListener('mouseenter', function() {
                navItem.classList.add('menu-mobile-hover');
            });
            
            link.addEventListener('mouseleave', function() {
                navItem.classList.remove('menu-mobile-hover');
            });
        }
        
        // Touch effects for mobile/tablet
        if (isMobile) {
            link.addEventListener('touchstart', function() {
                if (isSmallMobile) {
                    navItem.classList.add('menu-mobile-hover');
                    
                    setTimeout(() => {
                        navItem.classList.remove('menu-mobile-hover');
                    }, 500);
                } else {
                    link.classList.add('menu-tablet-hover');
                    
                    setTimeout(() => {
                        link.classList.remove('menu-tablet-hover');
                    }, 500);
                }
            });
        }
    });
    
    // Handle window resize to adapt menu behavior
    window.addEventListener('resize', function() {
        const newWidth = window.innerWidth;
        const newIsMobile = newWidth <= 768;
        const newIsSmallMobile = newWidth <= 480;
        
        // Only reload if crossing between mobile/desktop thresholds
        if ((newIsMobile !== isMobile) || (newIsSmallMobile !== isSmallMobile)) {
            // Remove all animations and transforms
            menuItems.forEach(item => {
                item.style.animation = '';
                item.style.transform = '';
            });
            
            // Force reload to apply correct styles after short delay
            setTimeout(() => {
                location.reload();
            }, 100);
        }
    });
    
    // Add a toggle button for mobile menu if in mobile view
    if (isSmallMobile && !document.querySelector('.mobile-menu-toggle')) {
        const mobileMenuContainer = document.querySelector('.nav-menu').parentNode;
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        
        // Create hamburger icon markup
        const hamburgerIcon = document.createElement('div');
        hamburgerIcon.className = 'hamburger-icon';
        hamburgerIcon.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        `;
        
        // Create text span
        const menuText = document.createElement('span');
        menuText.textContent = 'Navigation Menu';
        
        // Add elements to button
        menuToggle.appendChild(menuText);
        menuToggle.appendChild(hamburgerIcon);
        
        // Add subtle animation effect on load
        setTimeout(() => {
            menuToggle.style.opacity = '0';
            menuToggle.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                menuToggle.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                menuToggle.style.opacity = '1';
                menuToggle.style.transform = 'translateY(0)';
            }, 100);
        }, 0);
        
        // Add toggle functionality
        const navMenu = document.querySelector('.nav-menu');
        navMenu.style.display = 'none'; // Initially hidden
        
        menuToggle.addEventListener('click', function() {
            // Show loading state briefly
            this.classList.add('is-loading');
            
            // Simulate a brief loading period for effect
            setTimeout(() => {
                this.classList.remove('is-loading');
                
                if (navMenu.style.display === 'none') {
                    // Opening menu
                    navMenu.style.display = 'flex';
                    navMenu.style.opacity = '0';
                    navMenu.style.transform = 'translateY(-10px)';
                    
                    // Add active state to button
                    this.classList.add('is-active');
                    menuText.textContent = 'Close Menu';
                    
                    // Animate menu in
                    setTimeout(() => {
                        navMenu.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        navMenu.style.opacity = '1';
                        navMenu.style.transform = 'translateY(0)';
                    }, 50);
                    
                    // Add click outside to close
                    document.addEventListener('click', closeMenuOnClickOutside);
                } else {
                    // Closing menu
                    closeMenu();
                }
            }, 300); // Short "loading" delay for effect
        });
        
        // Function to close menu
        function closeMenu() {
            navMenu.style.opacity = '0';
            navMenu.style.transform = 'translateY(-10px)';
            
            // Remove active state from button
            menuToggle.classList.remove('is-active');
            menuText.textContent = 'Navigation Menu';
            
            // Delay hiding to allow animation to complete
            setTimeout(() => {
                navMenu.style.display = 'none';
            }, 300);
            
            // Remove click outside event
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
        
        // Function to close menu when clicking outside
        function closeMenuOnClickOutside(event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                // Show brief loading animation
                menuToggle.classList.add('is-loading');
                
                setTimeout(() => {
                    menuToggle.classList.remove('is-loading');
                    closeMenu();
                }, 200);
            }
        }
        
        // Add hover sound effect
        if (window.AudioContext || window.webkitAudioContext) {
            menuToggle.addEventListener('mouseenter', function() {
                // Create a subtle hover sound
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = 1500;
                gainNode.gain.value = 0.05;
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(1500, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.02);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
            });
        }
        
        // Insert before the nav menu
        mobileMenuContainer.insertBefore(menuToggle, navMenu);
        
        // Add a subtle pulse animation to draw attention to the menu button
        setTimeout(() => {
            menuToggle.classList.add('pulse');
            setTimeout(() => {
                menuToggle.classList.remove('pulse');
            }, 2000);
        }, 2000);
    }
}

/**
 * Sets up subtle sound effects for menu interactions
 */
function setupMenuSounds() {
    // Create audio elements if Web Audio is supported
    if (window.AudioContext || window.webkitAudioContext) {
        const menuLinks = document.querySelectorAll('.menu-link');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create hover sound
        /*
        function createHoverSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 1200;
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Set a very quick fade in/out to avoid clicks
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        }
        */
        
        // Create click sound
        function createClickSound() {
            // Disabled - no sound on click
            return;
        }
        
        // Add sound events to menu items
        menuLinks.forEach(link => {
            link.addEventListener('mouseenter', playHoverSound);
            
            link.addEventListener('click', function() {
                // Click sound disabled
                return;
            });
        });
    }
}

// Direct notification helper function
function showNotification(message, type = 'info', title = null) {
    if (window.journeyNotification) {
        window.journeyNotification.notify({
            title: title || 'The Journey',
            message: message,
            type: type
        });
    } else {
        // Fallback to alert if notification system isn't available
        alert(message);
    }
} 