import os
import sys
import time
import re
from collections import defaultdict
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pipeline.rag import (
    setup_pipeline, ask, build_vectorstore, chunk_documents,
    load_documents, create_qa_chain, detect_organism
)
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
_vectorstore = None


def _get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        docs = load_documents()
        chunks = chunk_documents(docs)
        _vectorstore = build_vectorstore(chunks)
    return _vectorstore


def get_chain(mode: str = "research"):
    global _chains
    if mode not in _chains:
        if not os.path.exists("data/osdr_documents.json"):
            fetch_all()
        vs = _get_vectorstore()
        _chains[mode] = create_qa_chain(vs, mode)
    return _chains[mode]


# ---------------------------------------------------------------------------
# Pydantic models for request/response validation
# ---------------------------------------------------------------------------

class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, description="The space biology question")
    mode: str = Field("research", description="Query mode: 'casual' or 'research'")


class ResearchRequest(BaseModel):
    """Request body for /api/research — detailed mode with full citations."""
    question: str = Field(..., min_length=1, description="The space biology question")


class CasualRequest(BaseModel):
    """Request body for /api/casual — summarized quick answers."""
    question: str = Field(..., min_length=1, description="The space biology question")


class AnswerSource(BaseModel):
    datasetId: str
    title: str
    url: Optional[str] = None
    organism: Optional[str] = None
    sampleCount: Optional[int] = None


class ToolExecution(BaseModel):
    id: str
    name: str
    description: str
    status: str = "completed"
    params: Optional[dict] = None
    result: Optional[str] = None


class ResearchResponse(BaseModel):
    answer: str
    sources: list[AnswerSource]
    mode: str
    confidence: Optional[str] = None
    organism_detected: Optional[str] = None
    toolsExecuted: list[ToolExecution] = []
    suggestedFollowups: list[str] = []
    pythonCode: Optional[str] = None
    pythonOutput: Optional[str] = None


# ---------------------------------------------------------------------------
# Helper: transform pipeline output -> frontend-compatible response
# ---------------------------------------------------------------------------

def _generate_followups(question: str, organism: Optional[str]) -> list[str]:
    """Generate contextual follow-up suggestions based on the question and organism."""
    q = question.lower()
    followups = []

    if "bone" in q or "osteo" in q:
        followups = [
            "How does microgravity-induced bone loss compare between rodents and humans?",
            "What countermeasures are effective against spaceflight osteopenia?",
            "Which genes regulate osteoclast activity in microgravity?",
        ]
    elif "muscle" in q or "atrophy" in q:
        followups = [
            "What role does the ubiquitin-proteasome pathway play in spaceflight muscle atrophy?",
            "How effective is resistive exercise at preventing muscle loss in orbit?",
            "Which transcription factors are dysregulated in soleus muscle during spaceflight?",
        ]
    elif "immune" in q or "lymphocyte" in q or "cytokine" in q:
        followups = [
            "How does spaceflight affect T-cell receptor diversity?",
            "What cytokine profiles change during long-duration missions?",
            "Are immune changes reversible after return to Earth?",
        ]
    elif "radiation" in q or "dna" in q or "cosmic" in q:
        followups = [
            "What types of DNA damage are most prevalent from galactic cosmic rays?",
            "How do DNA repair mechanisms function differently in microgravity?",
            "What is the cancer risk from a Mars transit mission?",
        ]
    elif "plant" in q or "arabidopsis" in q or "seed" in q:
        followups = [
            "How does root gravitropism change in microgravity?",
            "What gene expression patterns differ in space-grown Arabidopsis?",
            "Can plants effectively provide life support in long-duration missions?",
        ]
    elif "gene" in q or "expression" in q or "transcript" in q:
        followups = [
            "Which biological pathways are most consistently altered across spaceflight datasets?",
            "How do epigenetic modifications change during spaceflight?",
            "What are the top differentially expressed genes in liver tissue after ISS missions?",
        ]
    else:
        followups = [
            "What biological systems are most affected by microgravity?",
            "How do spaceflight effects differ between short and long-duration missions?",
            "What are the key findings from NASA's Rodent Research missions?",
        ]

    return followups


def _transform_sources(raw_sources: list[dict]) -> list[AnswerSource]:
    """Convert pipeline source dicts to frontend-compatible AnswerSource objects."""
    transformed = []
    for src in raw_sources:
        osd_id = src.get("osd_id", "unknown")
        snippet = src.get("snippet", "")

        # Extract a title from the snippet (first meaningful line)
        title_lines = [
            line.strip() for line in snippet.split("\n")
            if line.strip() and not line.strip().startswith("OSD-ID:")
        ]
        title = title_lines[0] if title_lines else f"NASA OSDR Dataset {osd_id}"

        # Clean up title — remove field prefixes like "title: " or "description: "
        for prefix in ["title: ", "description: ", "organism: "]:
            if title.lower().startswith(prefix):
                title = title[len(prefix):]
                break

        # Truncate long titles
        if len(title) > 120:
            title = title[:117] + "..."

        transformed.append(AnswerSource(
            datasetId=osd_id,
            title=title,
            url=src.get("url"),
            organism=src.get("organism"),
            sampleCount=None,  # pipeline doesn't provide this
        ))
    return transformed


def _build_tool_executions(question: str, sources_count: int, mode: str) -> list[ToolExecution]:
    """Generate tool execution metadata reflecting what the pipeline actually did."""
    tools = [
        ToolExecution(
            id="tool-rag-retrieve",
            name="query_osdr_vectorstore",
            description="Searching ChromaDB vectorstore across 630+ NASA OSDR datasets using semantic similarity",
            status="completed",
            params={"query": question, "top_k": 25},
            result=f"Retrieved {sources_count} unique relevant dataset chunks",
        ),
        ToolExecution(
            id="tool-llm-generate",
            name="generate_answer_llm",
            description=f"Generating {'concise' if mode == 'casual' else 'detailed research'} answer via Groq LLM (llama-3.1-8b-instant)",
            status="completed",
            params={"mode": mode, "temperature": 0.1},
            result="Answer synthesized from retrieved context",
        ),
    ]
    return tools


def _pipeline_to_research_response(pipeline_result: dict, question: str, mode: str) -> ResearchResponse:
    """Transform the raw pipeline output into the frontend's expected ResearchResponse."""
    answer = pipeline_result.get("answer", "")
    raw_sources = pipeline_result.get("sources", [])
    confidence = pipeline_result.get("confidence", "low")
    organism = pipeline_result.get("organism_detected")

    sources = _transform_sources(raw_sources)
    tools = _build_tool_executions(question, len(sources), mode)
    followups = _generate_followups(question, organism)

    return ResearchResponse(
        answer=answer,
        sources=sources,
        mode=mode,
        confidence=confidence,
        organism_detected=organism,
        toolsExecuted=tools,
        suggestedFollowups=followups,
        pythonCode=None,
        pythonOutput=None,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "datasets": 630}


@app.post("/ask")
def ask_question(request: Request, body: dict):
    """Original /ask endpoint — preserved for backward compatibility."""
    # Rate limit
    client_ip = request.client.host
    check_rate_limit(client_ip)

    question = body.get("question", "").strip()
    mode = body.get("mode", "research").strip().lower()

    if not question:
        raise HTTPException(400, "Question is required")
    if mode not in ("casual", "research"):
        mode = "research"

    try:
        chain = get_chain(mode)
        return ask(chain, question)
    except Exception as e:
        raise HTTPException(500, f"Error processing question: {str(e)}")


@app.post("/api/research", response_model=ResearchResponse)
def research_question(request: Request, body: ResearchRequest):
    """
    Detailed research endpoint — returns comprehensive answers with full
    citations, source datasets, tool execution logs, and follow-up suggestions.

    Request body: { "question": "your question here" }
    Mode is always 'research' (hardcoded from URL).
    """
    client_ip = request.client.host
    check_rate_limit(client_ip)

    question = body.question.strip()
    if not question:
        raise HTTPException(400, "Question is required")

    try:
        chain = get_chain("research")
        pipeline_result = ask(chain, question)
        return _pipeline_to_research_response(pipeline_result, question, "research")
    except Exception as e:
        raise HTTPException(500, detail=f"Error processing research question: {str(e)}")


@app.post("/api/casual", response_model=ResearchResponse)
def casual_question(request: Request, body: CasualRequest):
    """
    Casual endpoint — returns a quick, summarized 1-2 sentence answer.

    Request body: { "question": "your question here" }
    Mode is always 'casual' (hardcoded from URL).
    """
    client_ip = request.client.host
    check_rate_limit(client_ip)

    question = body.question.strip()
    if not question:
        raise HTTPException(400, "Question is required")

    try:
        chain = get_chain("casual")
        pipeline_result = ask(chain, question)
        return _pipeline_to_research_response(pipeline_result, question, "casual")
    except Exception as e:
        raise HTTPException(500, detail=f"Error processing casual question: {str(e)}")


@app.post("/refresh")
def refresh():
    global _chains, _vectorstore
    fetch_all()
    _chains = {}
    _vectorstore = None
    return {"status": "refreshed"}
