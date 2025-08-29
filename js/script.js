document.addEventListener('DOMContentLoaded', function() {
    // Transparent Header
    const header = document.querySelector('header');
    
    function updateHeaderBackground() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateHeaderBackground);
    updateHeaderBackground();
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Scroll Reveal Animation
    function revealElements() {
        const reveals = document.querySelectorAll('.reveal-text, .reveal-item');
        
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100 && elementBottom > 0) {
                element.classList.add('active');
            }
        });
    }
    
    // Connecting Lines Animation
    function animateLines() {
        const lines = document.querySelectorAll('.line');
        
        lines.forEach(line => {
            const lineTop = line.getBoundingClientRect().top;
            const lineBottom = line.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            if (lineTop < windowHeight - 100 && lineBottom > 0) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }
    
    // Showcase Sections Animation
    function animateShowcase() {
        const showcaseSections = document.querySelectorAll('.showcase-section');
        
        showcaseSections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            // Make section active when it's in view
            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('active');
                
                // Get the screen index from the section
                const screenIndex = section.dataset.screen;
                
                // Update all screens in all phone frames
                document.querySelectorAll('.screen').forEach(screen => {
                    if (screen.dataset.index === screenIndex) {
                        screen.classList.add('active');
                    } else {
                        screen.classList.remove('active');
                    }
                });
            } else {
                section.classList.remove('active');
            }
        });
    }
    
    // Run all scroll animations
    function handleScroll() {
        revealElements();
        animateLines();
        animateShowcase();
    }
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Initialize animations on page load
    setTimeout(handleScroll, 100);
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (nav.classList.contains('active')) {
                    mobileMenuBtn.classList.remove('active');
                    nav.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
    
    // Fix Safari bug with video autoplay
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.play().catch(error => {
            console.log("Video autoplay was prevented. This is common in some browsers.", error);
            // Add a play button or some other fallback if needed
        });
    }

    
});

// Function to set random vibrant colors for connecting lines
function randomizeLineColors() {
    // Vibrant colors array (not limited to your palette)
    const vibrantColors = [
        '#FF5252', // Red
        '#FF9800', // Orange
        '#FFEB3B', // Yellow
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#E91E63', // Pink
        '#00BCD4', // Cyan
        '#76FF03', // Lime
        '#FF4081'  // Pink accent
    ];
    
    // Select all lines and update their colors
    document.querySelectorAll('.connecting-lines path').forEach(path => {
        // Get random color
        const randomColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
        // Set the stroke color
        path.setAttribute('stroke', randomColor);
    });
    
    // Log confirmation for debugging
    console.log('Line colors randomized!');
}

// Ensure this runs when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Other existing code...
    
    // Run the line color randomization
    randomizeLineColors();
});