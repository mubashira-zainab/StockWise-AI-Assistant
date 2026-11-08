# StockWise AI

> **Intelligent Business. Smarter Decisions.**
> Premium AI-powered Business Intelligence, Inventory Optimization, and Sales Analytics SaaS Platform.

StockWise AI is an intelligent business assistant that helps small and medium-sized businesses manage inventory, understand sales performance, analyze profit margins, prevent stockouts, and make data-driven decisions through high-speed AI conversations powered by the Groq API.

---

## 🌟 Key Capabilities

### 1. Three-Panel AI Workspace
- **Left Panel (Navigation & Conversations)**:
  - Multi-threaded conversation history with instant search and archiving.
  - One-click navigation across **Dashboard**, **AI Assistant**, **Inventory**, **Sales**, **Insights**, **Reports**, and **Settings**.
  - Mobile-responsive drawer navigation and desktop collapsible sidebar.
- **Center Panel (AI Chat & Business Intelligence Workspace)**:
  - Real-time conversational AI grounded in your live store data (zero hallucinations).
  - Pre-engineered business starters: inventory health checks, restock suggestions, margin diagnostics, and cost reduction strategies.
  - Copy response, regenerate messages, and timestamp tracking.
- **Right Panel (AI & Business Control Center)**:
  - Live store telemetry: total products, inventory valuation, cost basis, recent revenue, and low stock count.
  - Three strictly controlled response styles: **Concise** (1–3 sentences), **Balanced** (1–2 paragraphs), and **Detailed** (full audit).
  - Configurable Groq AI models (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, `gemma2-9b-it`).

### 2. Complete Inventory Management
- Add, edit, and delete catalog products with SKU, category, purchase cost, selling price, and supplier tracking.
- Automated low-stock and out-of-stock priority alerts.
- One-click "Ask AI About Product" to evaluate demand trends and safety stock levels.

### 3. Sales & Margin Analytics
- Record customer transactions with instant profit, cost, and margin calculations.
- Detailed historical sales ledger with tabular numbers.
- Export inventory and sales data directly to standard CSV format.

### 4. Progressive Web App (PWA)
- Fully installable on Chrome, Android, Edge, and iOS Safari.
- Custom service worker with offline data access.
- In-app install banner with guided iOS Safari home screen instructions.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/stockwise-ai.git
cd stockwise-ai

# Install dependencies
npm install
```

### 3. Obtain a Free Groq API Key
1. Visit the [Groq Console](https://console.groq.com/keys).
2. Create a free account (no credit card required).
3. Click **Create API Key**, give it a name (e.g. `StockWise-AI`), and copy your key (`gsk_...`).

### 4. Configure Local Environment (`.env`)
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` to include your Groq credentials:
```env
# Groq API Key
GROQ_API_KEY="gsk_your_actual_groq_api_key_here"

# Groq Model (Default: Llama 3.3 70B for business intelligence)
GROQ_MODEL="llama-3.3-70b-versatile"

# Port (Default: 3000)
PORT=3000
```

> **Security Note:** The `.env` file is excluded in `.gitignore` and must never be committed to public version control.

### 5. Run the Application
```bash
# Start the full-stack server (Node.js Express + Vite)
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

---

## ☁️ Deployment Guide (Vercel)

StockWise AI is pre-configured with Vercel serverless function compatibility (`/api/chat`, `/api/status`, etc.).

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit: StockWise AI SaaS Platform"
git branch -M main
git remote add origin https://github.com/your-username/stockwise-ai.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** → **Project**.
3. Select and import your `stockwise-ai` GitHub repository.

### Step 3: Configure Environment Variables in Vercel
In the Vercel **Configure Project** screen (or via **Settings** → **Environment Variables** after import):

Add the following environment variables:
| Variable Name | Value | Description |
|---|---|---|
| `GROQ_API_KEY` | `gsk_...` | Your secret Groq API Key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Recommended default model |

Click **Deploy**. Vercel will build the frontend and deploy the serverless API routes automatically.

---

## 📱 Mobile Installation (PWA)

StockWise AI is a certified Progressive Web App:

- **Android / Chrome / Desktop**: Click the **Install App** button in the header or sidebar to install the app on your home screen or desktop launcher.
- **iPhone / iPad (iOS Safari)**:
  1. Open StockWise AI in Safari.
  2. Tap the **Share** button in the bottom toolbar.
  3. Scroll down and tap **Add to Home Screen**.
  4. Tap **Add** in the top right.

---

## 🛡️ License

StockWise AI is distributed under the Apache-2.0 License.
