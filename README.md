# 🥦 LeftoverLens

**Turn your fridge leftovers into tonight's dinner.**

LeftoverLens is an AI-powered web app that identifies ingredients from a photo and suggests recipes to reduce food waste. Built with React, Node.js, and Claude AI.

![LeftoverLens Demo](docs/demo.gif)

---

## ✨ Features

- 📷 **Photo-based ingredient detection** — snap or upload a photo; Claude AI identifies every food item
- 🥘 **Smart recipe suggestions** — ranked by how many of your ingredients they use
- 🌿 **Freshness estimation** — visual cues help flag items to use first
- 💡 **Preservation tips** — storage guides and freezing/pickling instructions
- 🛒 **Missing item list** — shows what to buy + substitutes to avoid waste
- ⚙️ **Dietary filters** — vegan, vegetarian, gluten-free, keto, and more
- 📱 **Mobile-friendly** — works great on phones with the camera interface

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, CSS Variables |
| Backend | Node.js, Express |
| AI | Anthropic Claude API (vision + text) |
| Deployment | Railway / Render / Vercel + Railway |

---

## 📁 Project Structure

```
leftoverlens/
├── frontend/               # React app (Vite)
│   ├── src/
│   │   ├── pages/          # LandingPage, ScanPage, IngredientsPage, RecipesPage, ...
│   │   ├── components/     # Header
│   │   └── index.css       # Design system + global styles
│   ├── .env.example
│   └── vite.config.js
├── backend/                # Express API server
│   ├── routes/
│   │   ├── analyze.js      # Image analysis (Claude Vision)
│   │   ├── recipes.js      # Recipe generation (Claude)
│   │   └── tips.js         # Preservation tips (Claude)
│   ├── server.js
│   └── .env.example
├── .gitignore
├── package.json            # Root scripts
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/leftoverlens.git
cd leftoverlens
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001 (already set)
```

### 4. Run the app

```bash
# From root — runs both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

---

## 🌐 Deployment

### Option A: Railway (Recommended — full-stack, one platform)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Choose **Deploy from GitHub repo**
4. Add environment variables in Railway dashboard:
   - `ANTHROPIC_API_KEY` = your key
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
5. Railway auto-detects Node.js and runs `npm start`
6. In production, the Express server serves the built React app

**Before deploying, build the frontend:**
```bash
cd frontend && npm run build
```

The backend `server.js` already serves `frontend/dist` in production mode.

---

### Option B: Render (Free tier available)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build command:** `npm run install:all && npm run build`
   - **Start command:** `npm start`
   - **Environment:** Node
5. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `NODE_ENV=production`

---

### Option C: Vercel (Frontend) + Railway (Backend) — Split deploy

**Frontend → Vercel:**
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add env var: `VITE_API_URL=https://your-railway-backend.railway.app`
4. Deploy

**Backend → Railway:**
1. Create Railway project from same repo
2. Set **Root Directory** to `backend`
3. Add env vars: `ANTHROPIC_API_KEY`, `NODE_ENV=production`, `ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`

---

### Option D: Self-hosted VPS (Ubuntu/Debian)

```bash
# 1. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone and install
git clone https://github.com/YOUR_USERNAME/leftoverlens.git
cd leftoverlens
npm run install:all

# 3. Build frontend
npm run build

# 4. Set environment variables
cd backend
cp .env.example .env
nano .env  # add ANTHROPIC_API_KEY, set NODE_ENV=production

# 5. Run with PM2 (process manager)
npm install -g pm2
cd ..
pm2 start backend/server.js --name leftoverlens
pm2 save
pm2 startup

# 6. Optional: Nginx reverse proxy
# Proxy localhost:3001 → your domain
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | — | Your Anthropic API key |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `ALLOWED_ORIGINS` | No | localhost | Comma-separated allowed CORS origins |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `""` | Backend URL. Empty = same origin (production) |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze/base64` | Analyze base64 image → ingredient list |
| `POST` | `/api/analyze` | Analyze uploaded image file |
| `POST` | `/api/recipes/suggest` | Generate recipe suggestions |
| `POST` | `/api/recipes/shopping-list` | Generate shopping list for a recipe |
| `POST` | `/api/tips/preservation` | Get preservation tips for ingredients |

### Example: Analyze an image

```bash
curl -X POST http://localhost:3001/api/analyze/base64 \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64_string>", "mediaType": "image/jpeg"}'
```

### Example: Get recipes

```bash
curl -X POST http://localhost:3001/api/recipes/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": [
      {"name": "broccoli", "freshness": "good", "quantity": "1 head"},
      {"name": "eggs", "freshness": "fresh", "quantity": "4"},
      {"name": "cheddar", "freshness": "good", "quantity": "100g"}
    ],
    "filters": {"dietary": "vegetarian", "maxTime": 30}
  }'
```

---

## 📝 License

MIT — free to use, modify, and deploy.

---

## 🤝 Contributing

PRs welcome! See issues for feature ideas and known bugs.

---

## 🙏 Acknowledgements

Built with [Claude AI](https://anthropic.com) · Inspired by the global food waste crisis
