# CXR Fitness Club

![CXR Fitness Club](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop)

CXR Fitness Club is a premium, modern, and responsive landing page for a luxury gym. Built with a focus on high-end aesthetics, smooth animations, and seamless user experience.

## ✨ Features

- **Modern Glassmorphism Design:** A sleek, dark-themed UI featuring frosted glass elements, vibrant accents, and smooth hover effects.
- **Scroll Animations:** Beautiful fade-in and slide-up animations as you scroll down the page, powered by the Intersection Observer API.
- **Interactive BMI Calculator:** A built-in Body Mass Index calculator that gives instant health feedback.
- **Dynamic Counters:** Animated statistics counters in the About section.
- **Fully Responsive:** Adapts perfectly to desktops, tablets, and mobile devices with a custom hamburger menu.
- **Working Contact Form:** Integrated directly with a **Supabase PostgreSQL database** using native `fetch` API to capture and store user inquiries instantly.

## 🛠️ Technologies Used

- **HTML5** (Semantic structure)
- **CSS3** (Custom variables, Flexbox, CSS Grid, Glassmorphism UI)
- **Vanilla JavaScript** (DOM manipulation, scroll observation, fetch API)
- **Supabase** (Backend as a Service / PostgreSQL database)
- **FontAwesome** (Icons)
- **Google Fonts** (Bebas Neue & Poppins)

## 🚀 Getting Started

### Prerequisites
No special tools required! You just need a modern web browser.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/akki07-hub/FUTURE_FS_03.git
   ```
2. Navigate into the project directory:
   ```bash
   cd FUTURE_FS_03
   ```
3. Open `index.html` in your browser, or start a local server:
   ```bash
   # Using Python 3
   python -m http.server 8080
   ```
   Then visit `http://localhost:8080`

## 🗄️ Database Setup (Supabase)

The contact form is connected to a Supabase database. If you wish to set up your own database to receive messages:

1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** and run the following to create the table and enable anonymous inserts:
   ```sql
   CREATE TABLE public.contact_messages (
       id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
       name text NOT NULL,
       email text NOT NULL,
       phone_number text NOT NULL,
       message text NOT NULL,
       created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow public inserts" 
   ON public.contact_messages
   FOR INSERT TO anon WITH CHECK (true);
   ```
3. Open `script.js` and replace `supabaseUrl` and `supabaseKey` with your project's unique URL and anonymous public key.

## 📍 Location
**Old Gajuwaka**, beside Sai Priya Function Hall, Kanithi Road, Visakhapatnam, Andhra Pradesh 530026.