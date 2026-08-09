"""
Pydantic models for request validation and response serialization.
"""

from typing import Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class AskRequest(BaseModel):
    """Request body for the legacy /ask endpoint."""
    question: str = Field(..., min_length=1, description="The space biology question")
    mode: str = Field("research", description="Query mode: 'casual' or 'research'")


class HistoryMessage(BaseModel):
    """A single conversation turn."""
    question: str
    answer: str

class ResearchRequest(BaseModel):
    """Request body for /api/research — detailed mode with full citations."""
    question: str = Field(..., min_length=1, description="The space biology question")
    history: list[HistoryMessage] = Field(default_factory=list, description="Previous Q&A turns for multi-turn context")


class CasualRequest(BaseModel):
    """Request body for /api/casual — summarized quick answers."""
    question: str = Field(..., min_length=1, description="The space biology question")
    history: list[HistoryMessage] = Field(default_factory=list, description="Previous Q&A turns for multi-turn context")


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class AnswerSource(BaseModel):
    """A single NASA OSDR dataset referenced in the answer."""
    datasetId: str
    title: str
    url: Optional[str] = None
    organism: Optional[str] = None
    sampleCount: Optional[int] = None


class ToolExecution(BaseModel):
    """Metadata about a pipeline step that was executed."""
    id: str
    name: str
    description: str
    status: str = "completed"
    params: Optional[dict] = None
    result: Optional[str] = None


class ResearchResponse(BaseModel):
    """Full response payload matching the frontend's ResearchAnswer type."""
    answer: str
    sources: list[AnswerSource]
    mode: str
    confidence: Optional[str] = None
    organism_detected: Optional[str] = None
    toolsExecuted: list[ToolExecution] = []
    suggestedFollowups: list[str] = []
    pythonCode: Optional[str] = None
    pythonOutput: Optional[str] = None
