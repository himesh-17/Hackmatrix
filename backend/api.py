import os
import sys
import time
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pipeline.rag import setup_pipeline, ask, build_vectorstore, chunk_documents, load_documents, create_qa_chain
from pipeline.fetch_data import fetch_all

app = FastAPI(title="Space Biology Knowledge Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting: 10 requests per minute per IP
_rate_limits = defaultdict(list)
RATE_LIMIT = 10
RATE_WINDOW = 60  # seconds


def check_rate_limit(ip: str):
    now = time.time()
    _rate_limits[ip] = [t for t in _rate_limits[ip] if now - t < RATE_WINDOW]
    if len(_rate_limits[ip]) >= RATE_LIMIT:
        raise HTTPException(429, "Rate limit exceeded. Try again in a minute.")
    _rate_limits[ip].append(now)


_chains = {}


def _get_vectorstore():
    docs = load_documents()
    chunks = chunk_documents(docs)
    return build_vectorstore(chunks)


def get_chain(mode: str = "research"):
    global _chains
    if mode not in _chains:
        if not os.path.exists("data/osdr_documents.json"):
            fetch_all()
        vs = _get_vectorstore()
        _chains[mode] = create_qa_chain(vs, mode)
    return _chains[mode]


@app.get("/health")
def health():
    return {"status": "ok", "datasets": 630}


@app.post("/ask")
def ask_question(request: Request, body: dict):
    # Rate limit
    client_ip = request.client.host
    check_rate_limit(client_ip)

    question = body.get("question", "").strip()
    mode = body.get("mode", "research").strip().lower()
    history = body.get("history", [])

    if not question:
        raise HTTPException(400, "Question is required")
    if mode not in ("casual", "research"):
        mode = "research"

    try:
        chain = get_chain(mode)
        return ask(chain, question, history)
    except Exception as e:
        raise HTTPException(500, f"Error processing question: {str(e)}")


@app.post("/refresh")
def refresh():
    global _chains
    fetch_all()
    _chains = {}
    return {"status": "refreshed"}
