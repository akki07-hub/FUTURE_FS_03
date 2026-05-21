const initCxrFitnessSite = () => {
    // 1. Sticky Navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animations using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Counter Animation for Stats
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    const startCounters = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    
                    // Lower inc to slow and higher to fast
                    const inc = target / speed;
                    
                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target + (target > 100 ? '+' : '');
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    };

    const counterObserver = new IntersectionObserver(startCounters, { threshold: 0.5 });
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // 4. BMI Calculator Logic
    const bmiForm = document.getElementById('bmi-form');
    const bmiResult = document.getElementById('bmi-result');
    const bmiValueEl = document.getElementById('bmi-value');
    const bmiStatusEl = document.getElementById('bmi-status');

    if (bmiForm) {
        bmiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const heightCm = document.getElementById('height').value;
            const weightKg = document.getElementById('weight').value;

            if (heightCm > 0 && weightKg > 0) {
                const heightM = heightCm / 100;
                const bmi = (weightKg / (heightM * heightM)).toFixed(1);
                
                bmiValueEl.innerText = bmi;
                
                let status = '';
                if (bmi < 18.5) {
                    status = 'Underweight - Time to build!';
                    bmiValueEl.style.color = '#3498db';
                } else if (bmi >= 18.5 && bmi <= 24.9) {
                    status = 'Normal weight - Keep it up!';
                    bmiValueEl.style.color = '#2ecc71';
                } else if (bmi >= 25 && bmi <= 29.9) {
                    status = 'Overweight - Let\'s get to work!';
                    bmiValueEl.style.color = '#f39c12';
                } else {
                    status = 'Obese - We are here to help!';
                    bmiValueEl.style.color = '#e74c3c';
                }

                bmiStatusEl.innerText = status;
                bmiResult.classList.remove('hidden');
            }
        });
    }

    // 5. Mobile Menu Toggle (Basic implementation)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if(navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(10,10,10,0.95)';
                navLinks.style.padding = '20px 0';
                navLinks.style.textAlign = 'center';
            }
        });
    }

    // 6. Supabase Integration for Contact Form
    const contactForm = document.getElementById('supabase-contact-form');
    const contactStatus = document.getElementById('contact-status');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    const supabaseUrl = 'https://tcfeyekenssupsrnjhmy.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZmV5ZWtlbnNzdXBzcm5qaG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzkzNDYsImV4cCI6MjA5NDkxNTM0Nn0.5HrSrzAC6q5gJnkwohDb97bxTGAraD1dVJWytQRTIT0';

    const showContactStatus = (message, color) => {
        if (!contactStatus) return;
        contactStatus.style.display = 'block';
        contactStatus.style.color = color;
        contactStatus.innerText = message;
    };

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const phone = document.getElementById('contact-phone').value;
            const message = document.getElementById('contact-message').value;

            // Basic validation
            if (!name || !email || !phone || !message) return;

            contactSubmitBtn.innerText = 'Sending...';
            contactSubmitBtn.disabled = true;

            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone_number: phone,
                        message: message
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || errorData.details || response.statusText);
                }

                // Success
                contactForm.reset();
                showContactStatus('Thank you! Your message has been received.', '#2ecc71');
                
                setTimeout(() => {
                    contactStatus.style.display = 'none';
                }, 5000);
            } catch (error) {
                console.error('Error submitting form:', error);
                const errorMessage = error.message || 'Oops! Something went wrong. Please try again.';
                showContactStatus('Error: ' + errorMessage, '#e74c3c');
            } finally {
                contactSubmitBtn.innerText = 'Send Message';
                contactSubmitBtn.disabled = false;
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCxrFitnessSite);
} else {
    initCxrFitnessSite();
}
