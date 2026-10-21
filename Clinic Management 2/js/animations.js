/**
 * MedPulse Advanced Micro-Animations & Dynamic Interactions Engine
 * Features:
 * - 3D Perspective Tilt on Hover for Cards
 * - Scroll Progress Bar Indicator
 * - IntersectionObserver Scroll Reveal animations
 * - Ripple Click Effect for buttons
 * - Dynamic Counter Numbers for stats
 */

// Scroll Progress Bar Tracker
function initScrollProgress() {
    let progressBar = document.getElementById('scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        document.body.prepend(progressBar);
    }

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (window.pageYOffset / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });
}

// 3D Card Tilt Engine
function init3DTilt() {
    const cards = document.querySelectorAll('.doctor-card, .quick-card, .hero-main-card, .notice-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8; // degrees
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}

// Scroll Reveal with IntersectionObserver
function initScrollReveal() {
    const targets = document.querySelectorAll('.section-title-wrap, .quick-card, .doctor-card, .review-card, .notice-card, .booking-wizard-card');
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach((target, index) => {
        target.classList.add('reveal-init');
        // Add staggering
        if (index % 3 === 1) target.classList.add('reveal-delay-1');
        if (index % 3 === 2) target.classList.add('reveal-delay-2');
        observer.observe(target);
    });
}

// Ripple Click Effect on Buttons
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;

        const rect = btn.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');
        circle.style.position = 'absolute';
        circle.style.borderRadius = '50%';
        circle.style.transform = 'scale(0)';
        circle.style.animation = 'rippleMotion 0.6s linear';
        circle.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        circle.style.pointerEvents = 'none';

        const existingRipple = btn.querySelector('.ripple');
        if (existingRipple) existingRipple.remove();

        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    });
}

// Animated Counter Numbers for Stats
function initCounters() {
    const statItems = document.querySelectorAll('.stat-item h3');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statItems.forEach(item => {
                    const text = item.innerText;
                    if (text.includes('45,000')) {
                        animateValue(item, 0, 45000, 2000, '+', true);
                    } else if (text.includes('99.4')) {
                        animateDecimal(item, 80.0, 99.4, 2000, '%');
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) observer.observe(heroStats);
}

function animateValue(obj, start, end, duration, suffix = '', isFormatted = false) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = Math.floor(progress * (end - start) + start);
        obj.innerHTML = (isFormatted ? val.toLocaleString() : val) + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function animateDecimal(obj, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = (progress * (end - start) + start).toFixed(1);
        obj.innerHTML = val + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Keyframe CSS for Ripple motion
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleMotion {
        to {
            transform: scale(3.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    init3DTilt();
    initScrollReveal();
    initRippleEffect();
    initCounters();
});

