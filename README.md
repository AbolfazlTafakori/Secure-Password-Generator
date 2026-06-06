# 🔐 Secure Password Generator

A clean, fast, and truly private password generator for Chrome.

![Version](https://img.shields.io/badge/Version-2.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-brightgreen)

## ✨ Features

- Cryptographically secure passwords using browser's Crypto API
- Unbiased random generation (rejection sampling — no modulo bias)
- Guaranteed inclusion of every selected character type
- Customizable length from 8 to 128 characters
- Support for lowercase, uppercase, numbers, and symbols
- Option to exclude similar characters (o, O, 0, i, I, l, L, 1)
- Option to exclude ambiguous characters
- Entropy-based password strength indicator (Very Weak → Very Strong)
- One-click copy — click the password to copy instantly
- Keyboard accessible (Tab + Enter to copy)
- Completely offline and private
- No permissions required
- No data collection or tracking

## 🛡️ Security & Privacy

This extension is built with maximum privacy in mind:
- No data is stored
- No telemetry or analytics
- No remote code
- Uses `crypto.getRandomValues()` for cryptographic security
- Strength meter based on real entropy bits, not heuristics

## 🆕 What's New in v2.0

- **Unbiased randomness** — fixed modulo bias in character selection
- **Guaranteed character types** — every selected type always appears in the password
- **Entropy-based strength meter** — accurate scoring using `length × log₂(pool size)`
- **Strength label** — shows Very Weak / Weak / Medium / Strong / Very Strong
- **Auto-regenerate** — password updates live as you change the length
- **Input validation** — length is always clamped between 8 and 128
- **Keyboard support** — fully navigable with Tab and Enter
- **Improved symbols pool** — includes `[]{}~` for higher entropy

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
