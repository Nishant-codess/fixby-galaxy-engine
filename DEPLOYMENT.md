# 🚀 Fixby Deployment Guide — Free & Fast

This guide explains how to deploy **Fixby Galaxy Engine** completely for **FREE** in under 3 minutes.

Since Fixby includes both an AI/ML backend (`FastAPI`, `SentenceTransformers`, `Groq/Gemini`) and an interactive Web Console (`3D Three.js`, `One UI Simulator`, `Interactive DAG`), you can deploy it as a **unified single service** or **split into frontend + backend**.

---

## ⚡ Method 1: Hugging Face Spaces (Recommended for AI / ML)
> **Best for:** Highest performance, zero RAM limits. Hugging Face provides **16 GB RAM + 2 vCPUs** for free (no credit card required).

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space).
2. Set a **Space name** (e.g. `fixby-galaxy-engine`).
3. Select **Docker** as the Space SDK (Blank).
4. Choose **Public** and click **Create Space**.
5. Connect your GitHub repository (`Nishant-codess/fixby-galaxy-engine`) or push this code to the HF Space git remote:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR-USERNAME>/fixby-galaxy-engine
   git push hf develop:main
   ```
6. In **Settings > Variables and secrets**, add your environment variables:
   - `FIXBY_API_KEY`: `test-api-key-123`
   - `GROQ_API_KEY`: *(your Groq API key)*
   - `GEMINI_API_KEY`: *(your Gemini API key)*
   - `USE_MOCK`: `false` (or `true` if testing without LLM keys)
7. ✨ **Done!** Your app will be live at `https://<YOUR-USERNAME>-fixby-galaxy-engine.hf.space` in ~90 seconds!

---

## 🌐 Method 2: Render.com (1-Click Blueprint Deploy)
> **Best for:** Standard free web hosting with automated GitHub sync.

1. Go to [render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** > **Blueprint**.
3. Select your repository: `Nishant-codess/fixby-galaxy-engine`.
4. Render will automatically detect [`render.yaml`](./render.yaml).
5. Click **Apply**.
6. (Optional) In the service settings, add your AI keys:
   - `GROQ_API_KEY`: *(your Groq API key)*
   - `GEMINI_API_KEY`: *(your Gemini API key)*
7. ✨ **Done!** Render will build and deploy your app at:
   `https://fixby-galaxy-engine.onrender.com/` (Landing page)
   `https://fixby-galaxy-engine.onrender.com/demo.html` (Interactive Console)
   `https://fixby-galaxy-engine.onrender.com/docs` (FastAPI Swagger UI)

---

## ⚡ Method 3: Koyeb (Fast Free Docker / Git Deploy)
> **Best for:** Fast worldwide edge hosting with free nano instances.

1. Go to [koyeb.com](https://app.koyeb.com/) and create a free account.
2. Click **Create App** > Choose **GitHub**.
3. Select `Nishant-codess/fixby-galaxy-engine` and branch `develop`.
4. Choose **Dockerfile** as the build method.
5. Set environment variables (`FIXBY_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`).
6. Click **Deploy**.

---

## ⚡ Method 4: Instant Public URL in 30 Seconds (Cloudflare Tunnel)
> **Best for:** Immediate live demo to judges or teammates without waiting for cloud builds.

If your backend is running locally on port 8000:
```bash
# Using Cloudflare Quick Tunnel (Free, no account needed):
npx untun@latest tunnel http://localhost:8000

# Or using ngrok:
ngrok http 8000
```
This instantly generates a public HTTPS URL (e.g. `https://random-subdomain.trycloudflare.com`) pointing directly to your engine!

---

## 📱 URL Routing After Deployment

| Route | Description |
|:---|:---|
| `/` | Ambient 3D Three.js product showcase & landing page |
| `/demo.html` | Interactive Diagnostic Console with One UI simulator & DAG |
| `/health` | Health check endpoint (`{"status": "healthy"}`) |
| `/docs` | Interactive Swagger API documentation |
| `/v1/troubleshoot` | Core troubleshooting API endpoint (`POST`) |
| `/v1/analytics` | Telemetry & performance analytics endpoint (`GET`) |
