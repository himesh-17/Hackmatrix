import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
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
    return {"status": "ok"}


@app.post("/ask")
def ask_question(body: dict):
    question = body.get("question", "").strip()
    mode = body.get("mode", "research").strip().lower()
    if not question:
        raise HTTPException(400, "Question is required")
    if mode not in ("casual", "research"):
        mode = "research"
    chain = get_chain(mode)
    return ask(chain, question)


@app.post("/refresh")
def refresh():
    global _chains
    fetch_all()
    _chains = {}
    return {"status": "refreshed"}
