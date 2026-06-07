# FlowAI Pro 🚀

**n8n-inspired workflow automation platform** — React 19 + Node.js + tRPC + MySQL

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template)

---

## 🚀 One-Click Deploy on Railway

1. Click the button above **or** fork this repo and import it into [Railway](https://railway.com)
2. Set the required environment variables (see below)
3. Railway auto-detects Node.js, builds, and deploys

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL/TiDB connection string | Yes |
| `JWT_SECRET` | Secret for signing JWTs | Yes |
| `VITE_APP_ID` | OAuth App ID | Optional |
| `OAUTH_SERVER_URL` | OAuth server URL | Optional |
| `PORT` | Port (Railway sets this automatically) | Auto |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 + Tailwind CSS 4 |
| Backend | Node.js + Express + tRPC 11 |
| Database | MySQL / TiDB (Drizzle ORM) |
| UI | shadcn/ui + Radix UI |
| Editor | React Flow |

---

## 📦 Build & Run

```bash
pnpm install
pnpm build    # production build
pnpm start    # start server
pnpm dev      # development mode
```

---

## ✨ Features

- **Visual Workflow Editor** — drag-and-drop React Flow canvas
- **Pre-built Node Palette** — Triggers, AI (Gemini), Logic, Data, Comms, Output
- **Execution History** — every run tracked with status, duration, logs
- **Settings** — API key management for Gemini, Telegram, webhooks
- **Dark Theme** — professional n8n-inspired dark UI

---

*MIT License*
