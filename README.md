# 🧬 Space Biology Knowledge Engine

> A RAG-powered dashboard that answers natural language questions about space biology using NASA's Open Science Data Repository (OSDR) datasets.

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![NASA OSDR](https://img.shields.io/badge/NASA-OSDR-orange)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Demo Queries](#-demo-queries)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

The Space Biology Knowledge Engine is a hackathon project built for NASA Space Apps 2025. It allows researchers and enthusiasts to query space biology datasets using natural language and receive accurate, cited answers.

**What it does:**
- Fetches 630+ datasets from NASA's OSDR API
- Embeds and indexes them locally using HuggingFace embeddings
- Answers questions using RAG (Retrieval-Augmented Generation)
- Provides two modes: **Casual** (simple answers) and **Research** (detailed with citations)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                    http://localhost:5173                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ POST /ask
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│                    http://localhost:8000                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Embeddings │  │   ChromaDB   │  │   Groq LLM      │   │
│  │  (HuggingFace)│ │  (Vector DB) │  │  (llama-3.1-8b) │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Fetch
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              NASA OSDR API (630 datasets)                    │
│        https://visualization.osdr.nasa.gov/biodata/api/v2   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Natural Language Query** | Ask questions in plain English |
| 📚 **630+ Datasets** | Comprehensive NASA space biology data |
| 🎯 **Dual Modes** | Casual (simple) and Research (detailed with citations) |
| ⚡ **Local Embeddings** | Fast, free, no API limits using HuggingFace |
| 🔒 **Rate Limiting** | 10 requests/min per IP |
| 📊 **Confidence Scoring** | High/Medium/Low based on source availability |
| 🧬 **Organism Detection** | Identifies human/mouse/rat/plant from questions |

---

## 📦 Prerequisites

- **Python 3.13+**
- **Node.js 18+** (for frontend)
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))
- **Google AI API Key** (free at [aistudio.google.com](https://aistudio.google.com))

---

## 🚀 Installation

### 1. Clone the Repository

```powershell
git clone https://github.com/yourusername/Nasa-bio.git
cd Nasa-bio
```

### 2. Install Python Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```powershell
# Required
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Optional (for deployment)
PYTHONUNBUFFERED=1
```

---

## 🏃 Usage

### Step 1: Fetch NASA OSDR Data

Fetch all 630 datasets (takes ~5 minutes):

```powershell
python -m pipeline.fetch_data 630
```

Or fetch a smaller subset for testing:

```powershell
python -m pipeline.fetch_data 100
```

### Step 2: Start the Backend Server

```powershell
python -m backend.main
```

The server will:
- Build the vectorstore on first run (~30 seconds)
- Load existing vectorstore on subsequent runs (instant)
- Run at `http://localhost:8000`

### Step 3: Start the Frontend

Open a new terminal:

```powershell
cd frontend
npm run dev
```

The frontend will run at `http://localhost:5173`

### Step 4: Test the API

**Casual Mode:**
```powershell
$body = '{"question": "How does space affect bones?", "mode": "casual"}'
Invoke-RestMethod -Uri http://localhost:8000/ask -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty answer
```

**Research Mode:**
```powershell
$body = '{"question": "How does space affect bones?", "mode": "research"}'
Invoke-RestMethod -Uri http://localhost:8000/ask -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty answer
```

---

## 📡 API Reference

### `POST /ask`

Ask a question about space biology.

**Request Body:**
```json
{
  "question": "How does microgravity affect the immune system?",
  "mode": "research"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | Your question about space biology |
| `mode` | string | No | `casual` (default) or `research` |

**Response:**
```json
{
  "answer": "Microgravity causes immune system dysregulation...",
  "sources": [
    {
      "osd_id": "OSD-326",
      "url": "https://osdr.nasa.gov/osdr/datasets/OSD-326",
      "snippet": "Study findings..."
    }
  ],
  "confidence": "high",
  "organism_detected": "human"
}
```

### `GET /health`

Check server status.

**Response:**
```json
{
  "status": "ok",
  "datasets": 630
}
```

### `POST /refresh`

Re-fetch data and rebuild vectorstore.

**Response:**
```json
{
  "status": "refreshed"
}
```

---

## 🧪 Demo Queries

### Gene Expression & Omics

```powershell
$body = '{"question": "Which genes are consistently upregulated in mouse liver tissue after ISS spaceflight?", "mode": "research"}'
Invoke-RestMethod -Uri http://localhost:8000/ask -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty answer
```

### Human Health

```powershell
$body = '{"question": "What clinical assays were collected from Inspiration4 civilian astronauts?", "mode": "research"}'
Invoke-RestMethod -Uri http://localhost:8000/ask -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty answer
```

### Comparative Biology

```powershell
$body = '{"question": "Do humans and rodents experience the same biological effects during spaceflight?", "mode": "research"}'
Invoke-RestMethod -Uri http://localhost:8000/ask -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty answer
```

### Casual Mode (Simple Answers)

```powershell
$body = '{"question": "What happens to bones in space?", "mode": "casual"}'
Invoke-RestMethod -Uri http://localhost:8000/ask -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty answer
```

---

## 📁 Project Structure

```
Nasa-bio/
├── backend/
│   ├── __init__.py
│   ├── api.py              # FastAPI endpoints
│   └── main.py             # Server entry point
├── pipeline/
│   ├── __init__.py
│   ├── fetch_data.py       # OSDR data fetching
│   └── rag.py              # RAG pipeline (embeddings, retrieval, generation)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── data/           # Static data
│   ├── package.json
│   └── vite.config.ts
├── data/
│   └── osdr_documents.json # Fetched OSDR datasets
├── chroma_db/              # Persistent vectorstore
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (gitignored)
├── .gitignore
└── README.md
```

---

## 🔧 Troubleshooting

### Issue: `429 RESOURCE_EXHAUSTED` (Google API)

**Solution:** The project now uses local HuggingFace embeddings. No Google API needed for embeddings.

### Issue: `react-dom` not found

```powershell
cd frontend
npm install react-dom
```

### Issue: Vectorstore not building

```powershell
# Delete and rebuild
Remove-Item -Recurse -Force chroma_db
python -m backend.main
```

### Issue: Slow first query

First query builds the vectorstore. Subsequent queries are instant.

### Issue: `rate limit exceeded`

Wait 60 seconds before sending another request (10 req/min limit).

---

## 📊 Dataset Statistics

| Organism | Count |
|----------|-------|
| Mouse (Mus musculus) | 239 |
| Human (Homo sapiens) | 107 |
| Arabidopsis | 61 |
| Microbiota | 42 |
| Rat | 33 |
| Drosophila | 17 |
| C. elegans | 9 |
| **Total** | **630** |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI, Python 3.13 |
| **Frontend** | React, TypeScript, Vite |
| **Embeddings** | HuggingFace (all-MiniLM-L6-v2) |
| **Vector DB** | ChromaDB |
| **LLM** | Groq (llama-3.1-8b-instant) |
| **Data Source** | NASA OSDR API |

---

## 📝 License

This project was built for NASA Space Apps 2025 Hackathon.

---

## 🙏 Acknowledgments

- NASA for the OSDR open datasets
- Groq for fast LLM inference
- HuggingFace for local embeddings
- The Space Apps community

---

**Built with ❤️ for NASA Space Apps 2025**
