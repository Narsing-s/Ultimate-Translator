# 🌍 Ultimate Translator Pro

A modern responsive browser translator with automatic translation, voice input, text-to-speech, searchable history, favorites, sharing, document import, image/OCR workspace, interpreter mode and PWA installation support.

## ✨ Features

### Translation
- Automatic translation while typing with a short debounce
- Manual Translate now action
- Source auto-detection
- 40+ selectable languages
- Source/target swap
- Copy, paste and clear
- Character counters and live status
- Text improvement helper

### Voice & conversation
- Browser speech recognition input
- Text-to-speech output
- Conversation/interpreter workspace for two speakers
- Speaker A ↔ Speaker B translation flow

### Documents & images
- TXT, CSV and JSON document import directly in the browser
- PDF/DOCX workspace with browser capability messaging
- Image/OCR workspace for image uploads
- Extracted text can be sent directly to the translator

### History & sharing
- Up to 100 recent translations per browser user
- Search history
- Favorite/unfavorite translations
- Delete individual entries
- Clear all history
- Restore a translation by clicking it
- Export/import history as JSON
- Native share when supported, clipboard fallback otherwise

### App experience
- Modern responsive glass-style UI
- Light/dark mode
- Mobile-friendly stacked panes
- Installable PWA shell
- Service worker caching for the app shell
- Keyboard-friendly controls and accessible labels
- No build step required

## 🔐 Authentication

Authentication remains intentionally demo-only and browser-local. Credentials, counters and translation history are stored in `localStorage`, while the active session is stored in `sessionStorage`. This is not production authentication.

For production, use a server-side identity system with password hashing, secure sessions/tokens, rate limiting and appropriate data protection.

## 🌐 Translation service

The current frontend uses the public Google translation endpoint directly from the browser. Availability, CORS behavior and rate limits are controlled by that service. For a production product, put a supported translation provider behind a backend/API layer and keep credentials server-side.

## 📱 PWA

The repository includes `manifest.webmanifest` and `sw.js`. On supported browsers the app can be installed from the browser's install UI/menu. The service worker caches the local application shell; translation still requires network access.

## 🚀 Run locally

No build step is required. Serve the repository with a static HTTP server rather than opening the HTML with `file://` when testing PWA/service-worker features.

Example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Chrome or Edge is recommended for the best speech-recognition experience.

## 📁 Structure

```text
Ultimate-Translator/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── LICENSE
└── .github/
    └── workflows/
```

## ⚠️ Browser capability notes

- Speech recognition depends on browser and microphone permissions.
- Native sharing depends on browser/device support.
- TXT/CSV/JSON import is fully browser-based.
- PDF/DOCX extraction and OCR are capability-dependent and are intentionally surfaced as browser tools rather than pretending every browser can extract every file format.
- The public translation endpoint is not a guaranteed production API.

## 📄 License

MIT License. See `LICENSE`.

## 👨‍💻 Author

Narsinga Beesetti
