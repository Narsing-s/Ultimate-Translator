# 🌍 Ultimate Translator Pro

A modern, responsive browser translator built with plain HTML, CSS and JavaScript. It combines multilingual text translation, language detection, voice input, text-to-speech, local history and export tools in a single workspace.

## ✨ What is included

### Translation
- Auto-detect source language
- 30+ selectable languages
- Real source ↔ target language swapping
- Google Translate public endpoint integration
- Clear, copy and paste actions
- Character counter and translation status

### Voice & accessibility
- Browser Speech Recognition voice input
- Text-to-speech for translated output
- Keyboard-friendly controls
- Responsive desktop and mobile layout

### Productivity
- Recent translation history (up to 30 items per browser user)
- Click a history item to restore the translation
- Clear-all history
- TXT, CSV and JSON export
- Local text-improvement helper for capitalization, spacing and punctuation

### Modern UI
- Glass-style responsive interface
- Light / dark mode with saved preference
- Two-pane translation workspace
- Compact toolbar and contextual actions
- Mobile layout that stacks translation panes cleanly
- No framework or external JavaScript dependency

## 🔐 Authentication note

This project intentionally has **demo-only browser authentication**. User credentials and history are stored in `localStorage`; the current session is stored in `sessionStorage`. This is suitable for a learning/demo application, but it is **not secure production authentication**.

For production, replace this with a server-side authentication system, password hashing, secure sessions, rate limiting and appropriate data protection.

## 🌐 Translation service note

The application currently calls Google's public translation endpoint directly from the browser. Availability, CORS behavior and rate limits are controlled by that service. A production deployment should place a supported translation provider behind a backend/API layer.

## 🚀 Run locally

No build step is required:

1. Clone the repository.
2. Open `index.html` in a modern browser, or serve the folder with any static web server.
3. Create a demo user and start translating.

Chrome or Edge is recommended for the best Speech Recognition support.

## 📁 Project structure

```text
Ultimate-Translator/
├── index.html
├── README.md
├── LICENSE
└── .github/
    └── workflows/
```

The current frontend is intentionally dependency-free so it can be deployed as a static site.

## 🧭 Recommended next production upgrades

- Backend authentication with secure password hashing
- Managed translation API with server-side credentials
- PWA/offline shell and install support
- Translation favorites and searchable history
- Document translation for TXT/PDF/DOCX
- Image OCR translation
- Conversation/interpreter mode
- Pronunciation controls and selectable voices
- Import/export history
- Optional cloud sync
- Automated browser tests and accessibility checks

## 📄 License

MIT License. See `LICENSE`.

## 👨‍💻 Author

Narsinga Beesetti
