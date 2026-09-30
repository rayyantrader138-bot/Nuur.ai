# Nuur AI Assistant

Bilingual (English / اردو) AI assistant: chat, image generation, and photo editing. Pure HTML/CSS/JS, no server or build step.

## Put it online (GitHub Pages)
1. Create a new GitHub repository and upload all files from this folder (`index.html`, `style.css`, `app.js`, `.nojekyll`).
2. Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main` / `(root)`, then Save.
3. After a minute your app is live at `https://<your-username>.github.io/<repo-name>/`.

## Using it (you and your friends)
Open the site → ⚙ Settings → pick a provider and paste your **own API key**.
- **Google Gemini** (free tier available): get a key at https://aistudio.google.com/apikey
- **OpenAI**: get a key at https://platform.openai.com/api-keys (image models may need organization verification)

Keys are stored only in each person's own browser (localStorage) and sent only to the chosen provider. Never put your key inside the code.

## Features
- Chat in English and Urdu (full right-to-left layout), voice input 🎤
- Images tab: describe an image, or attach your own photo (📎) and write what to change. Use "Edit this" to keep refining a result.
- Dark / Dim / Light themes

## Notes
- Model names are editable in Settings. If a provider renames a model, change it there.
- Voice input works in Chrome/Edge/Safari; not every browser supports it.
