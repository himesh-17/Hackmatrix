"""
FastAPI route definitions — thin routing layer.

All business logic lives in service.py. All Pydantic models live in schemas.py.
This file only defines endpoints and delegates to the service.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import (
    AskRequest, ResearchRequest, CasualRequest, ResearchResponse,
)
from backend.service import (
    check_rate_limit, RateLimitExceeded,
    query_pipeline, build_research_response, refresh_data,
)

app = FastAPI(title="Space Biology Knowledge Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    """Server health check."""
    return {"status": "ok", "datasets": 630}


@app.post("/ask")
def ask_question(request: Request, body: dict):
    """Legacy /ask endpoint — preserved for backward compatibility."""
    try:
        check_rate_limit(request.client.host)
    except RateLimitExceeded as e:
        raise HTTPException(429, str(e))

    question = body.get("question", "").strip()
    mode = body.get("mode", "research").strip().lower()

    if not question:
        raise HTTPException(400, "Question is required")
    if mode not in ("casual", "research"):
        mode = "research"

    try:
        return query_pipeline(question, mode)
    except Exception as e:
        raise HTTPException(500, f"Error processing question: {str(e)}")


@app.post("/api/research", response_model=ResearchResponse)
def research_question(request: Request, body: ResearchRequest):
    """
    Detailed research endpoint — returns comprehensive answers with full
    citations, source datasets, tool execution logs, and follow-up suggestions.

    Request body: { "question": "your question here" }
    """
    try:
        check_rate_limit(request.client.host)
    except RateLimitExceeded as e:
        raise HTTPException(429, str(e))

    question = body.question.strip()
    if not question:
        raise HTTPException(400, "Question is required")

    try:
        return build_research_response(question, "research")
    except Exception as e:
        raise HTTPException(500, detail=f"Error processing research question: {str(e)}")


@app.post("/api/casual", response_model=ResearchResponse)
def casual_question(request: Request, body: CasualRequest):
    """
    Casual endpoint — returns a quick, summarized 1-2 sentence answer.

    Request body: { "question": "your question here" }
    """
    try:
        check_rate_limit(request.client.host)
    except RateLimitExceeded as e:
        raise HTTPException(429, str(e))

    question = body.question.strip()
    if not question:
        raise HTTPException(400, "Question is required")

    try:
        return build_research_response(question, "casual")
    except Exception as e:
        raise HTTPException(500, detail=f"Error processing casual question: {str(e)}")


@app.post("/refresh")
def refresh():
    """Re-fetch NASA OSDR data and rebuild vectorstore."""
    return refresh_data()
