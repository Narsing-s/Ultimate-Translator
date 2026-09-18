# 🌍 Ultimate Translator Pro

A modern browser-first translation workspace focused on fast automatic translation, documents, voice, conversation, glossary control, privacy controls and installable PWA behavior.

## ✨ Features

### Translation
- Automatic translation while typing with debounce
- Manual Translate now action
- Source auto-detection
- 40+ languages
- Source/target swap
- Copy, paste, clear and share
- Character counters and live status
- Text improvement helper
- Long-text chunking for safer translation requests
- Personal glossary for preferred terminology
- Keyboard shortcuts

### Voice & conversation
- Browser speech recognition input
- Text-to-speech output
- Two-speaker conversation/interpreter workspace
- Speaker A ↔ Speaker B translation flow

### Documents
- TXT, CSV and JSON import
- PDF text extraction with PDF.js when available
- DOCX text extraction with Mammoth when available
- Multiple document selection
- Combined document preview
- Long-document translation in chunks
- Download translated text as TXT
- Scanned/protected PDFs may require an external OCR workflow; this project intentionally does not include an image/OCR workspace

### History & privacy
- Up to 100 recent translations per browser user
- Search history
- Favorites
- Delete individual entries
- Clear all history
- Restore a translation by clicking it
- Export/import history as JSON
- Optional **Do not save new translations to history** mode
- Account/local-data controls: clear local history/settings or delete the demo account from the device
- Native sharing with clipboard fallback

### App experience
- Responsive glass-style UI
- Light/dark mode
- Mobile-friendly stacked panes
- Installable PWA shell
- Service-worker caching
- Accessible labels and keyboard-friendly controls
- No frontend build step required

## 🔐 Authentication

Authentication is intentionally demo-only and browser-local. Credentials, counters and history are stored in localStorage; the active session is stored in sessionStorage.

For production use, add server-side identity, password hashing, secure sessions/tokens, rate limiting and appropriate data protection.

## 🌐 Translation service

The browser first uses the repository translation API when available. The API supports a Google Cloud Translation API key through the GOOGLE_TRANSLATE_API_KEY environment variable and chunks long text before sending it to the provider.

For static hosting where /api/translate is unavailable, the browser falls back to the public Google translation endpoint. That endpoint is not a guaranteed production API and may have availability/rate limits outside this repository's control.

## 📱 PWA

The repository includes manifest.webmanifest, sw.js, icon-192.svg and icon-512.svg.

On supported browsers, the Install button uses the browser install prompt. If a browser does not expose that prompt, use its Install app / Add to Home screen menu. Translation still requires network access.

## 🚀 Run locally

Serve the repository over HTTP rather than opening index.html with file:// when testing service workers and PWA behavior.

```bash
python -m http.server 8080
```

Then open http://localhost:8080.

Chrome or Edge is recommended for speech recognition and document-library compatibility.

## 📁 Structure

```text
Ultimate-Translator/
├── index.html
├── api/
│   └── translate.js
├── manifest.webmanifest
├── sw.js
├── icon-192.svg
├── icon-512.svg
├── README.md
├── LICENSE
└── .github/
    └── workflows/
```

## ⚠️ Browser capability notes

- Speech recognition depends on browser and microphone permissions.
- Native sharing depends on browser/device support.
- PDF/DOCX extraction depends on loading the browser libraries and on the file being readable.
- Scanned or password-protected PDFs may contain no extractable text.
- PWA installation behavior is browser-dependent.
- The demo account is browser-local; deleting it removes its local profile, history, glossary and privacy setting from that browser.
- Document translation currently downloads extracted translated text as TXT rather than recreating original PDF/DOCX/PPTX/XLSX layout.
- The public translation fallback is not a production SLA/API.

## 📄 License

MIT License. See LICENSE.

## 👨‍💻 Author

Narsinga Beesetti

### Optional production document translation

Set these server environment variables when deploying the API:

- `DEEPL_API_KEY` — enables formatted DOCX/PPTX/PDF/XLSX document translation through the DeepL Document API.
- `DEEPL_API_BASE` — optional; defaults to `https://api-free.deepl.com`. Use the appropriate DeepL API base for your plan.
- `GOOGLE_TRANSLATE_API_KEY` — optional text-translation provider.

With a DeepL key, the Documents workspace attempts **per-file formatted translation** and keeps the original document file type. Without it, the app safely falls back to browser extraction + text translation. DeepL and Google Cloud both document formatted document translation support for major office/PDF formats. citeturn0search0turn0search1turn0search7

The toolbar also supports Formal/Informal/Auto tone where the configured provider supports formality.
