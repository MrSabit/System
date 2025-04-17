/**
 * Mission Effects JavaScript
 * Adds visual effects and environment changes when a mission is active
 */

// Ensure script is loaded after all dependencies
document.addEventListener('DOMContentLoaded', function() {
    console.log("Mission effects script loaded");
    
    // Check URL parameters for mission completion
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mission_completed') === 'true') {
        console.log("Mission completed parameter detected");
        
        // Get XP value from URL
        const xpReward = urlParams.get('xp') || 500;
        showMissionCompletedAnimation(xpReward);
    }
    
    // Check for mission mode
    const missionModeActive = document.body.getAttribute('data-mission-active') === 'true';
    
    if (missionModeActive) {
        console.log("Mission mode active - applying effects");
        applyMissionEffects();
    }
});

/**
 * Applies all mission effects
 */
function applyMissionEffects() {
    document.body.classList.add('mission-active');
    createMissionAlert();
    createVisualEffects();
    createParticles();
    applyMissionFonts();
    setupRandomGlitches();
    enhanceNavigationMenu();
}

/**
 * Creates the mission alert bar at the top of the page
 */
function createMissionAlert() {
    const alertBar = document.createElement('div');
    alertBar.className = 'mission-alert';
    
    const alertContent = document.createElement('div');
    alertContent.className = 'mission-alert-content';
    
    const alertIcon = document.createElement('span');
    alertIcon.className = 'mission-alert-icon';
    alertIcon.innerHTML = '⚠️';
    
    const alertText = document.createElement('span');
    alertText.className = 'mission-alert-text';
    alertText.innerText = 'You are on a Mission!';
    
    alertContent.appendChild(alertIcon);
    alertContent.appendChild(alertText);
    alertBar.appendChild(alertContent);
    
    document.body.insertBefore(alertBar, document.body.firstChild);
}

/**
 * Creates visual overlay effects for mission mode
 */
function createVisualEffects() {
    // Create scanlines overlay
    const scanlines = document.createElement('div');
    scanlines.className = 'mission-scanlines';
    document.body.appendChild(scanlines);
    
    // Create vignette effect
    const vignette = document.createElement('div');
    vignette.className = 'mission-vignette';
    document.body.appendChild(vignette);
    
    // Create glitch layer
    const glitch = document.createElement('div');
    glitch.className = 'mission-glitch';
    document.body.appendChild(glitch);
}

/**
 * Creates floating particles in the background
 */
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'mission-particles';
    document.body.appendChild(particlesContainer);
    
    // Create particles
    const numParticles = 30;
    for (let i = 0; i < numParticles; i++) {
        createParticle(particlesContainer);
    }
}

/**
 * Creates a single floating particle
 */
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'mission-particle';
    
    // Random position
    const posX = Math.random() * window.innerWidth;
    const posY = Math.random() * window.innerHeight;
    
    // Random size between 2-6px
    const size = 2 + (Math.random() * 4);
    
    // Random animation duration between 15-40s
    const duration = 15 + (Math.random() * 25);
    
    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;
    particle.style.animationDuration = `${duration}s`;
    
    container.appendChild(particle);
    
    // Remove and recreate particle when animation ends
    particle.addEventListener('animationend', function() {
        particle.remove();
        createParticle(container);
    });
}

/**
 * Applies mission fonts to appropriate elements
 */
function applyMissionFonts() {
    // Apply Orbitron font to headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .mission-title, .nav-item span');
    headings.forEach(heading => {
        heading.style.fontFamily = "'Orbitron', sans-serif";
        heading.style.letterSpacing = "2px";
        heading.style.textTransform = "uppercase";
    });
    
    // Apply Space Mono to certain elements
    const monospaceElements = document.querySelectorAll('.mission-card p, .quest-description, .mission-card-description');
    monospaceElements.forEach(element => {
        element.style.fontFamily = "'Space Mono', monospace";
    });
    
    // Style mission buttons
    const buttons = document.querySelectorAll('.quest-button, .complete-mission-btn, .new-mission-btn');
    buttons.forEach(button => {
        button.classList.add('mission-action-btn');
    });
}

/**
 * Sets up random glitch effects that occur periodically
 */
function setupRandomGlitches() {
    const glitchLayer = document.querySelector('.mission-glitch');
    const scanlines = document.querySelector('.mission-scanlines');
    
    // Trigger glitch effect randomly
    setInterval(() => {
        if (Math.random() < 0.2) { // 20% chance per interval
            triggerGlitch(glitchLayer, scanlines);
        }
    }, 5000); // Check every 5 seconds
}

/**
 * Triggers a visual glitch effect
 */
function triggerGlitch(glitchLayer, scanlines) {
    // Random glitch duration between 200-500ms
    const duration = 200 + (Math.random() * 300);
    
    // Glitch layer effect
    glitchLayer.style.animation = `glitchEffect ${duration}ms`;
    
    // Scanline offset effect
    scanlines.style.animation = `scanlineGlitch ${duration}ms`;
    
    // Reset animations after they complete
    setTimeout(() => {
        glitchLayer.style.animation = '';
        scanlines.style.animation = '';
    }, duration);
}

/**
 * Enhances the navigation menu for mission mode
 */
function enhanceNavigationMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Add mission style to nav menu
    navMenu.style.position = 'relative';
    navMenu.style.zIndex = '1000';
    
    // Add glowing effect to non-mission menu items
    const menuItems = navMenu.querySelectorAll('.nav-item:not([style*="background: linear-gradient(135deg, rgba(185, 28, 28, 0.1)"])');
    menuItems.forEach(item => {
        // Add subtle red border
        item.style.borderColor = 'rgba(220, 38, 38, 0.3)';
        
        // Add hover effect
        item.addEventListener('mouseenter', () => {
            item.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.5)';
            item.style.borderColor = 'rgba(220, 38, 38, 0.5)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.boxShadow = '';
            item.style.borderColor = 'rgba(220, 38, 38, 0.3)';
        });
    });
}

/**
 * Shows a congratulatory firecracker animation when a mission is completed
 */
function showMissionCompletedAnimation(xpReward = 500) {
    try {
        console.log("Showing mission completed animation with " + xpReward + " XP");
        
        // Create container for the animation
        const container = document.createElement('div');
        container.className = 'mission-completed-container';
        document.body.appendChild(container);
        
        // Create congratulatory text
        const congratsText = document.createElement('div');
        congratsText.className = 'mission-completed-text';
        congratsText.textContent = 'MISSION COMPLETED!';
        container.appendChild(congratsText);
        
        // Create XP reward text
        const xpText = document.createElement('div');
        xpText.className = 'mission-xp-text';
        xpText.textContent = `+${xpReward} XP`;
        container.appendChild(xpText);
        
        // Create background overlay
        const overlay = document.createElement('div');
        overlay.className = 'mission-completed-overlay';
        container.appendChild(overlay);
        
        // Start animation
        setTimeout(() => {
            overlay.style.opacity = '0.7';
            congratsText.style.opacity = '1';
            congratsText.style.transform = 'scale(1)';
            
            setTimeout(() => {
                xpText.style.opacity = '1';
                xpText.style.transform = 'translateX(-50%) scale(1)';
                
                // Create fireworks
                createFireworks(container, 20);
                
                // Remove after animation completes
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    congratsText.style.opacity = '0';
                    congratsText.style.transform = 'scale(1.5) translateY(-50px)';
                    xpText.style.opacity = '0';
                    xpText.style.transform = 'translateX(-50%) scale(1.5)';
                    
                    setTimeout(() => {
                        if (container.parentNode) {
                            container.parentNode.removeChild(container);
                        }
                        
                        // Clean up URL parameter
                        const url = new URL(window.location);
                        url.searchParams.delete('mission_completed');
                        url.searchParams.delete('xp');
                        url.searchParams.delete('level');
                        window.history.replaceState({}, '', url);
                    }, 1000);
                }, 4000);
            }, 600);
        }, 100);
    } catch (error) {
        console.error('Error in mission completion animation:', error);
        // Fallback to simple notification
        if (window.journeyNotification) {
            window.journeyNotification.notify({
                title: 'Mission Completed',
                message: `You earned ${xpReward} XP!`,
                type: 'success'
            });
        }
    }
}

/**
 * Creates firework particles for the completion animation
 */
function createFireworks(container, count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            createFirework(container);
        }, i * 200); // Stagger firework launches
    }
}

/**
 * Creates a single firework with explosion effect
 */
function createFirework(container) {
    // Create the launch effect
    const launch = document.createElement('div');
    launch.className = 'firework-launch';
    launch.style.position = 'absolute';
    launch.style.bottom = '0';
    launch.style.left = `${10 + Math.random() * 80}%`;
    launch.style.width = '3px';
    launch.style.height = '10px';
    launch.style.backgroundColor = getRandomFireworkColor();
    launch.style.borderRadius = '50%';
    launch.style.boxShadow = `0 0 10px ${getRandomFireworkColor()}`;
    launch.style.zIndex = '5';
    launch.style.opacity = '0.8';
    container.appendChild(launch);
    
    // Animate the launch
    const launchDuration = 1000 + Math.random() * 500;
    const launchHeight = 30 + Math.random() * 50; // % of container height
    
    // Set animation for the launch
    launch.style.transition = `transform ${launchDuration}ms ease-out, height ${launchDuration}ms ease-out`;
    
    setTimeout(() => {
        launch.style.transform = `translateY(-${launchHeight}vh)`;
        launch.style.height = '4px';
        
        // Create explosion after launch reaches peak
        setTimeout(() => {
            // Remove the launch trail
            if (container.contains(launch)) {
                container.removeChild(launch);
            }
            
            // Create explosion
            const explosionCount = 20 + Math.floor(Math.random() * 30);
            const explosionColor = getRandomFireworkColor();
            const explosionX = launch.offsetLeft;
            const explosionY = container.offsetHeight * (1 - launchHeight / 100);
            
            for (let i = 0; i < explosionCount; i++) {
                createExplosionParticle(container, explosionX, explosionY, explosionColor);
            }
        }, launchDuration);
    }, 10);
}

/**
 * Creates a single explosion particle for the firework
 */
function createExplosionParticle(container, x, y, color) {
    const particle = document.createElement('div');
    particle.className = 'firework-particle';
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${2 + Math.random() * 3}px`;
    particle.style.height = `${2 + Math.random() * 3}px`;
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 8px ${color}`;
    particle.style.borderRadius = '50%';
    particle.style.zIndex = '5';
    particle.style.opacity = '1';
    particle.style.pointerEvents = 'none';
    container.appendChild(particle);
    
    // Randomize explosion direction and distance
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const duration = 500 + Math.random() * 1000;
    
    // Calculate end position
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;
    
    // Set transition
    particle.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${duration}ms ease-out`;
    
    // Start animation
    setTimeout(() => {
        particle.style.transform = `translate(${endX - x}px, ${endY - y}px) scale(0.2)`;
        particle.style.opacity = '0';
        
        // Remove particle when animation completes
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, duration);
    }, 10);
}

/**
 * Returns a random color for fireworks
 */
function getRandomFireworkColor() {
    const colors = [
        '#ff0000', // Red
        '#ffc107', // Gold
        '#3b82f6', // Blue
        '#10b981', // Green
        '#8b5cf6', // Purple
        '#f472b6', // Pink
        '#f97316'  // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}