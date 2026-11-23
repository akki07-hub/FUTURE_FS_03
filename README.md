# CXR Fitness Club

![CXR Fitness Club](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop)

CXR Fitness Club is a premium, modern, and responsive landing page for a luxury gym. Built with a focus on high-end aesthetics, smooth animations, and seamless user experience.

## ✨ Features

- **Modern Glassmorphism Design:** A sleek, dark-themed UI featuring frosted glass elements, vibrant accents, and smooth hover effects.
- **Scroll Animations:** Beautiful fade-in and slide-up animations as you scroll down the page, powered by the Intersection Observer API.
- **Interactive BMI Calculator:** A built-in Body Mass Index calculator that gives instant health feedback.
- **Dynamic Counters:** Animated statistics counters in the About section.
- **Fully Responsive:** Adapts perfectly to desktops, tablets, and mobile devices with a custom hamburger menu.
- **Working Contact & Free-Trial Forms:** Messages and trial bookings are validated and saved in the browser with `localStorage`, so the site works with no server or account.

## 🛠️ Technologies Used

- **HTML5** (Semantic structure)
- **CSS3** (Custom variables, Flexbox, CSS Grid, Glassmorphism UI)
- **Vanilla JavaScript** (DOM manipulation, scroll observation, fetch API)
- **localStorage** (saves form submissions in the browser)
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

## 🗄️ Data Storage

Contact messages and free-trial bookings are saved in the visitor's browser under the `cxr-fitness:messages:v1` localStorage key (see `window.CXR_STORE` in `script.js`). To view them, open the browser console on the site and run:

```js
CXR_STORE.list()
```

## 📍 Location
**1200 Fitness Way**, Austin, TX 78701 (demo address).