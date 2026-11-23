/*
 * CXR Fitness Club - Free Trial booking + CXR Assistant chat widget
 *
 * The assistant answers from the KNOWLEDGE list below (keyword matching, runs
 * fully in the browser, no API key needed). To upgrade it to a real LLM, send
 * the user's message to a serverless function (e.g. a Supabase Edge Function)
 * that calls the model, and use its reply inside getReply(). Never put an AI
 * API key in this file - anyone can read it.
 */
(function () {
    'use strict';

    /* ---------------- Gym facts (edit these per client) ---------------- */
    const GYM = {
        name: 'CXR Fitness Club',
        address: '1200 Fitness Way, Austin, TX 78701',
        phone: '(512) 555-0147',
        email: 'info@cxrfitness.com',
        hours: 'Mon-Fri 5:00 AM - 11:00 PM, Sat-Sun 7:00 AM - 9:00 PM. Elite members get 24/7 keycard access.'
    };

    /* ---------------- Booking modal ---------------- */
    const overlay = document.getElementById('booking-overlay');
    const bookingForm = document.getElementById('booking-form');
    const bookingStatus = document.getElementById('booking-status');
    const bookingSubmit = document.getElementById('booking-submit');
    const planSelect = document.getElementById('booking-plan');
    const dateInput = document.getElementById('booking-date');
    let lastFocus = null;

    function todayISO(offsetDays) {
        const d = new Date();
        d.setDate(d.getDate() + (offsetDays || 0));
        const tz = d.getTimezoneOffset() * 60000;
        return new Date(d - tz).toISOString().slice(0, 10);
    }

    function openBooking(plan) {
        if (!overlay) return;
        lastFocus = document.activeElement;
        if (plan && planSelect) planSelect.value = plan;
        if (dateInput) {
            dateInput.min = todayISO(0);
            if (!dateInput.value) dateInput.value = todayISO(1);
        }
        setStatus('', '');
        overlay.hidden = false;
        document.body.classList.add('modal-open');
        const first = document.getElementById('booking-name');
        if (first) setTimeout(() => first.focus(), 50);
    }

    function closeBooking() {
        if (!overlay) return;
        overlay.hidden = true;
        document.body.classList.remove('modal-open');
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function setStatus(msg, type) {
        if (!bookingStatus) return;
        bookingStatus.textContent = msg;
        bookingStatus.className = 'booking-status' + (type ? ' ' + type : '');
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-booking]');
        if (trigger) {
            e.preventDefault();
            openBooking(trigger.getAttribute('data-plan'));
        }
    });

    if (overlay) {
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBooking(); });
        document.getElementById('booking-close').addEventListener('click', closeBooking);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !overlay.hidden) closeBooking();
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const val = (id) => document.getElementById(id).value.trim();
            const data = {
                name: val('booking-name'),
                email: val('booking-email'),
                phone: val('booking-phone'),
                plan: val('booking-plan'),
                date: val('booking-date'),
                time: val('booking-time'),
                goal: val('booking-goal')
            };

            if (!data.name || !data.email || !data.phone || !data.date || !data.time) {
                setStatus('Please fill in your name, email, phone, date and time.', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                setStatus('Please enter a valid email address.', 'error');
                return;
            }
            if (data.date < todayISO(0)) {
                setStatus('Please choose today or a future date.', 'error');
                return;
            }

            bookingSubmit.disabled = true;
            bookingSubmit.textContent = 'Booking...';
            setStatus('', '');

            const prettyDate = new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
            });

            try {
                const sb = window.CXR_SUPABASE;
                if (!sb) throw new Error('Booking service is not configured.');
                // Saved into the existing contact_messages table so no schema change is needed.
                const res = await fetch(`${sb.url}/rest/v1/contact_messages`, {
                    method: 'POST',
                    headers: {
                        'apikey': sb.key,
                        'Authorization': `Bearer ${sb.key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        name: data.name,
                        email: data.email,
                        phone_number: data.phone,
                        message: `[FREE TRIAL REQUEST] Date: ${prettyDate} at ${data.time} | Plan interest: ${data.plan} | Goal: ${data.goal}`
                    })
                });
                if (!res.ok) {
                    let detail = res.statusText;
                    try { const j = await res.json(); detail = j.message || j.details || detail; } catch (_) { /* ignore */ }
                    throw new Error(detail);
                }
                bookingForm.reset();
                setStatus(`You're booked, ${data.name.split(' ')[0]}! See you ${prettyDate} at ${data.time}. We'll confirm by email shortly.`, 'success');
            } catch (err) {
                console.error('Booking failed:', err);
                setStatus(`Sorry, we couldn't save your booking right now. Please call us at ${GYM.phone}.`, 'error');
            } finally {
                bookingSubmit.disabled = false;
                bookingSubmit.textContent = 'Book My Free Trial';
            }
        });
    }

    /* ---------------- CXR Assistant ---------------- */
    const KNOWLEDGE = [
        {
            id: 'trial',
            keys: ['trial', 'free', 'try', 'visit', 'tour', 'day pass', 'first time', 'book', 'appointment', 'schedule'],
            reply: 'Your first visit is on us! A free trial includes a full day pass, a guided tour and a 20-minute session with a certified trainer. No credit card needed.',
            action: 'booking'
        },
        {
            id: 'pricing',
            keys: ['price', 'pricing', 'cost', 'how much', 'fee', 'membership', 'plan', 'plans', 'monthly', 'cheap', 'expensive', '$'],
            reply: 'We have 3 memberships:\n- Basic, $49/mo: gym equipment + locker room\n- Pro, $89/mo: adds group classes + 1 personal training session a month (most popular)\n- Elite, $149/mo: 24/7 access, 4 PT sessions a month, spa, sauna & recovery\nNo sign-up fee and no hidden charges.',
            action: 'booking'
        },
        {
            id: 'hours',
            keys: ['hour', 'hours', 'open', 'close', 'closing', 'timing', 'time', 'when', '24/7', 'weekend', 'sunday', 'saturday'],
            reply: `Our hours: ${GYM.hours}`
        },
        {
            id: 'location',
            keys: ['where', 'location', 'address', 'located', 'directions', 'parking', 'park', 'map', 'near'],
            reply: `We're at ${GYM.address}, with free member parking on site. You'll find a map at the bottom of this page.`,
            action: 'map'
        },
        {
            id: 'pt',
            keys: ['personal train', 'trainer', 'pt', 'how much for pt', 'pt price', 'pt cost', 'coach', 'one on one', '1 on 1', '1-on-1', 'session'],
            reply: 'All our trainers are certified. Pro includes 1 personal training session a month and Elite includes 4. Extra sessions are $45 each for members, or $160 for a 4-pack.'
        },
        {
            id: 'classes',
            keys: ['class', 'classes', 'hiit', 'cardio', 'yoga', 'group', 'spin', 'bootcamp'],
            reply: 'We run group classes every day: HIIT, strength circuits, spin, cardio bootcamp and mobility/yoga. Classes are included with Pro and Elite.'
        },
        {
            id: 'weightloss',
            keys: ['lose weight', 'weight loss', 'fat', 'slim', 'tone', 'diet', 'nutrition'],
            reply: 'Our Weight Loss program combines HIIT classes, strength training and a simple nutrition plan from your trainer. Most members start with Pro so they get classes and a monthly check-in with a PT.'
        },
        {
            id: 'muscle',
            keys: ['muscle', 'bulk', 'gain', 'strength', 'strong', 'lift', 'powerlifting', 'bodybuilding'],
            reply: 'For muscle gain and strength we have full free-weight areas, squat racks and platforms, plus structured programs designed by our coaches. Elite members get 4 PT sessions a month to dial in technique.'
        },
        {
            id: 'cancel',
            keys: ['cancel', 'contract', 'commitment', 'freeze', 'pause', 'refund', 'lock in'],
            reply: 'There are no long contracts. Memberships are month-to-month. You can cancel with 30 days notice or freeze your membership for up to 2 months a year.'
        },
        {
            id: 'amenities',
            keys: ['spa', 'sauna', 'shower', 'locker', 'towel', 'amenities', 'facility', 'facilities', 'equipment', 'recovery', 'wifi'],
            reply: 'Members get modern equipment, locker rooms and showers. Elite adds a premium locker with towel service, plus the spa, sauna and recovery zone.'
        },
        {
            id: 'bmi',
            keys: ['bmi', 'body mass', 'calculator'],
            reply: 'You can check your BMI with the free calculator on this page. Just enter your height in inches and weight in pounds.',
            action: 'bmi'
        },
        {
            id: 'contact',
            keys: ['contact', 'phone', 'call', 'email', 'talk', 'human', 'person', 'staff', 'someone'],
            reply: `You can call us at ${GYM.phone} or email ${GYM.email}. You can also leave a message in the contact form below and the team will get back to you the same day.`,
            action: 'contact'
        },
        {
            id: 'greeting',
            keys: ['hi', 'hello', 'hey', 'yo', 'good morning', 'good evening', 'sup'],
            reply: 'Hey there! How can I help you today?'
        },
        {
            id: 'thanks',
            keys: ['thanks', 'thank you', 'thx', 'awesome', 'great', 'cool', 'ok', 'okay'],
            reply: "You're welcome! Anything else I can help with?"
        }
    ];

    const CHIPS = ['Membership prices', 'Book a free trial', 'Opening hours', 'Personal training', 'Where are you?'];

    const launcher = document.getElementById('chat-launcher');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const messages = document.getElementById('chat-messages');
    const chips = document.getElementById('chat-chips');
    const chatForm = document.getElementById('chat-form');
    const chatText = document.getElementById('chat-text');
    if (!launcher || !panel) return;

    let started = false;

    function normalize(text) {
        return ' ' + text.toLowerCase().replace(/[^a-z0-9$/\s-]/g, ' ').replace(/\s+/g, ' ') + ' ';
    }

    function getReply(text) {
        const t = normalize(text);
        let best = null;
        let bestScore = 0;
        KNOWLEDGE.forEach((item) => {
            let score = 0;
            item.keys.forEach((k) => {
                // Short keys must match whole words; longer phrases can match anywhere.
                const hit = k.length <= 3 ? t.includes(' ' + k + ' ') : t.includes(k);
                if (hit) score += k.length > 4 ? 2 : 1;
            });
            // Greetings/thanks only win when nothing more specific matched.
            if ((item.id === 'greeting' || item.id === 'thanks') && score > 0) score = 0.5;
            if (score > bestScore) { bestScore = score; best = item; }
        });
        if (best) return best;
        return {
            id: 'fallback',
            reply: "Good question! I'm not sure about that one, but our team can help. Would you like to book a free trial or leave a message for the staff?",
            action: 'fallback'
        };
    }

    function addMessage(text, from) {
        const el = document.createElement('div');
        el.className = 'chat-msg ' + from;
        el.textContent = text;
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
        return el;
    }

    function addActions(action) {
        const map = {
            booking: [['Book free trial', () => openBooking()]],
            map: [['Show map', () => scrollToEl('.map-container')]],
            bmi: [['Open BMI calculator', () => scrollToEl('#bmi-form')]],
            contact: [['Go to contact form', () => scrollToEl('#contact')]],
            fallback: [['Book free trial', () => openBooking()], ['Message the team', () => scrollToEl('#contact')]]
        };
        const list = map[action];
        if (!list) return;
        const wrap = document.createElement('div');
        wrap.className = 'chat-actions';
        list.forEach(([label, fn]) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chat-action';
            b.textContent = label;
            b.addEventListener('click', fn);
            wrap.appendChild(b);
        });
        messages.appendChild(wrap);
        messages.scrollTop = messages.scrollHeight;
    }

    function scrollToEl(sel) {
        const el = document.querySelector(sel);
        if (!el) return;
        if (window.innerWidth < 600) toggleChat(false);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function botSay(item) {
        const typing = addMessage('', 'bot typing');
        typing.innerHTML = '<span></span><span></span><span></span>';
        const delay = Math.min(1200, 400 + item.reply.length * 4);
        setTimeout(() => {
            typing.remove();
            addMessage(item.reply, 'bot');
            if (item.action) addActions(item.action);
        }, delay);
    }

    function handleUser(text) {
        const clean = text.trim();
        if (!clean) return;
        addMessage(clean, 'user');
        botSay(getReply(clean));
    }

    function renderChips() {
        chips.innerHTML = '';
        CHIPS.forEach((label) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chat-chip';
            b.textContent = label;
            b.addEventListener('click', () => handleUser(label));
            chips.appendChild(b);
        });
    }

    function toggleChat(open) {
        const show = typeof open === 'boolean' ? open : panel.hidden;
        panel.hidden = !show;
        launcher.setAttribute('aria-expanded', String(show));
        launcher.classList.toggle('open', show);
        if (show) {
            launcher.classList.add('seen');
            if (!started) {
                started = true;
                renderChips();
                botSay({ reply: `Hi! I'm the ${GYM.name} assistant. I can answer questions about memberships, classes and hours, or book you a free trial. What would you like to know?` });
            }
            setTimeout(() => chatText.focus(), 50);
        }
    }

    launcher.addEventListener('click', () => toggleChat());
    closeBtn.addEventListener('click', () => toggleChat(false));
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUser(chatText.value);
        chatText.value = '';
    });

    // Expose for testing / future integrations
    window.CXRAssistant = { getReply, open: () => toggleChat(true), openBooking };
})();
