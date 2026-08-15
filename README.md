# 🔐 Secure Password Generator

A clean, fast, and truly private password generator for Chrome.

![Version](https://img.shields.io/badge/Version-2.1-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-brightgreen)

## ✨ Features

- Cryptographically secure passwords using browser's Crypto API
- Unbiased random generation (rejection sampling — no modulo bias)
- Guaranteed inclusion of every selected character type
- Customizable length from 8 to 128 characters with live slider
- Support for lowercase, uppercase, numbers, and symbols
- Option to exclude similar characters (o, O, 0, i, I, l, L, 1)
- Option to exclude ambiguous characters
- Entropy-based password strength indicator (Very Weak → Very Strong)
- One-click copy — click the password or use the Copy button
- Session history — view and re-copy your last 10 passwords
- Keyboard accessible (Tab + Enter to copy)
- Completely offline and private
- No data stored to disk — history clears when browser closes
- No telemetry or tracking

## 🛡️ Security & Privacy

This extension is built with maximum privacy in mind:
- No data is written to disk or synced
- Session history lives only in memory — cleared when the browser closes
- No telemetry or analytics
- No remote code execution
- Uses `crypto.getRandomValues()` for cryptographic security
- Strength meter based on real entropy bits, not heuristics

## 🆕 What's New in v2.1

- **Interactive Length Slider** — smooth real-time slider synchronized with the numeric input
- **Live Option Updates** — password instantly regenerates whenever any checkbox is toggled
- **Clear All History** — easily clear session history on demand with a single click
- **Safe Storage Fallback** — seamless fallback mechanism ensuring zero runtime crashes
- **Reliable Clipboard Copy** — integrated DOM fallback for 100% copy success
- **Monospace Display** — high-readability monospace font styling for password verification
- **Modern Dark UI** — refined layout, crisp action buttons, and smooth micro-animations

## 📥 Installation

### Chrome Web Store
[![Available in the Chrome Web Store](https://img.shields.io/badge/Available%20in%20Chrome%20Web%20Store-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/dnjdojjhmhdgljjiapkcchcobgnbchjk)

### Manual Installation (Developer Mode)
1. Clone or download this repository
2. Go to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the extension folder

## 📸 Screenshots

<img width="1280" height="800" alt="Secure Password Generator" src="https://github.com/user-attachments/assets/452a5c9d-7947-437a-8895-4eff2f3ca2e6" />

## 👨‍💻 Developed by

**ABOLFAZL**  
GitHub: [AbolfazlTafakori](https://github.com/AbolfazlTafakori)

---

⭐ If you like this extension, please leave a review on the Chrome Web Store!

**Keywords:** password generator, secure password, strong password, privacy focused, offline, no tracking
