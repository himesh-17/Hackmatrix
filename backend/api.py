import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pipeline.rag import setup_pipeline, ask
from pipeline.fetch_data import fetch_all

app = FastAPI(title="Space Biology Knowledge Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_qa_chain = None


def get_chain():
    global _qa_chain
    if _qa_chain is None:
        if not os.path.exists("data/osdr_documents.json"):
            fetch_all()
        _qa_chain = setup_pipeline()
    return _qa_chain


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask")
def ask_question(body: dict):
    question = body.get("question", "").strip()
    if not question:
        raise HTTPException(400, "Question is required")
    chain = get_chain()
    return ask(chain, question)


@app.post("/refresh")
def refresh():
    global _qa_chain
    fetch_all()
    _qa_chain = setup_pipeline()
    return {"status": "refreshed"}
