# 📈 QuantEdge — AI-Powered Investment Intelligence Platform

QuantEdge is a premium, state-of-the-art financial analysis and research dashboard tailored for Indian retail investors. By integrating **Next.js 16**, **Python FastAPI**, and **Groq LLaMA 3.3 70B**, QuantEdge transforms raw market data into institutional-grade stock intelligence, real-time interactive chats, and downloadable widescreen client presentations (.pptx).

---

## 📸 Platform Interface & Features

### 1. Live Interactive Analytics Dashboard
Explore live price movements, multi-year interactive financial statements, and shareholder patterns built on beautiful, fluid Tailwind and Framer Motion layouts.
<img width="1898" height="922" alt="image" src="https://github.com/user-attachments/assets/156bbef8-ba48-4dcb-b80e-bf06c27d437e" />

### 2. Multi-Signal Progressive AI Analysis
Our 4-step quantitative synthesis compiles financials, sentiment, and peer benchmarking in real-time, feeding a strict weighted rubric to deliver Buy/Hold/Avoid verdicts.
<img width="1567" height="659" alt="image" src="https://github.com/user-attachments/assets/9015675a-08d6-4167-b3bc-622cb89c77bc" />

---

## ✨ Features & Architecture Highlights

### ⚡ 3x Faster Parallelized AI Engine
* **Concurrent Step Processing:** Core analysis segments—**Financial Analysis**, **News Sentiment Scanning**, and **Peer Benchmarking**—run simultaneously using `Promise.allSettled` in the API route (`/api/ai/analyze/[ticker]`), slicing analysis execution times by 70%.
* **Granular SSE Streaming:** Real-time Server-Sent Events (SSE) stream back progress updates (Data Fetch, Financials, Sentiment, Benchmarking, Synthesis) to the frontend, updating the UI progressively as computations occur.
* **Backward Compatible Fallbacks:** Supports standard non-streaming formats for automated tools (like the PDF/PowerPoint report builders) via query arguments (`?stream=true`).

### 🛡️ Pre-emptive Stock Universe Validation
* **Zero-Hangs Guard:** Validates tickers in **<5ms** against a local `nifty500.json` universe before making expensive/hanging external Yahoo Finance hits.
* **Instant error boundary:** Rejects foreign/unsupported tickers (e.g. NYSE: KKR) safely with a standardized `404 Not Supported` response.

### 📊 Midnight Executive PPTX Report Generator
* **Automatic crore scaling:** Formats absolute figures consistently to **₹ Cr** denominations.
* **Robust fallback engines:** Prevents "N/A" outputs by running dynamic price-to-earnings fallback calculations (`trailingPE` ➔ `forwardPE` ➔ `Manual Price/EPS`).
* **High-fidelity chart bindings:** Injects real multi-year growth structures into presentation slide frames. [IDEA_QuantEdge_Report.pptx](https://github.com/user-attachments/files/28420523/IDEA_QuantEdge_Report.pptx)


### 💬 Real-Time Streaming Brokerage Chatbot
* **Native SSE integration:** Streams analytical text tokens directly to a native chat interface, enabling instant conversational answers regarding company financials.

---

## 🛠️ Technology Stack
* **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS, Framer Motion, Recharts, Lucide-react.
* **Data Microservice:** Python 3.11, FastAPI, Uvicorn, yfinance, python-pptx, pandas.
* **AI Engine:** LLaMA-3.3-70B-Versatile via Groq SDK.
* **Unit Testing:** Jest, React Testing Library.

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Next.js Frontend Configuration
PYTHON_BACKEND_URL=http://localhost:8000
GROQ_API_KEY=your_groq_api_key_here
```

Create a `.env` file in the `data-service/` directory:

```env
# Python FastAPI Microservice Configuration
PORT=8000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Frontend node modules
npm install

# Backend python requirements
cd data-service
python -m pip install -r requirements.txt
cd ..
```

### 2. Run the Development Servers
QuantEdge features a concurrently mapped run command that spins up both the Next.js frontend and Python FastAPI backend:

```bash
npm run dev:all
```
* Access the web dashboard: [http://localhost:3000](http://localhost:3000)
* Access the FastAPI docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running the Test Suite
QuantEdge uses Jest and React Testing Library to enforce zero regressions. Run the complete test suite with:

```bash
npm run test
```

All 18 tests covering badge elements, layout components, and sidebars run cleanly:
```bash
PASS __tests__/lib/utils.test.ts
PASS __tests__/components/ui/LoadingSkeleton.test.tsx
PASS __tests__/components/ui/MetricCard.test.tsx
PASS __tests__/components/ui/Badge.test.tsx
PASS __tests__/components/ui/SectionLabel.test.tsx
PASS __tests__/components/ui/DeltaPill.test.tsx
PASS __tests__/components/layout/Sidebar.test.tsx

Test Suites: 7 passed, 7 total
Tests:       18 passed, 18 total
Snapshots:   0 total
```
