import os
import json
import time
import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings

CHROMA_DIR = "chroma_db"
DATA_FILE = "data/osdr_documents.json"

# Organism detection patterns
ORGANISM_PATTERNS = {
    "human": r"\b(human|astronaut|inspiration4|twin study|patient|subject|lymphocyte|fibroblast)\b",
    "mouse": r"\b(mouse|mice|murine|rodent|mus musculus)\b",
    "rat": r"\b(rat|rattus)\b",
    "plant": r"\b(arabidopsis|plant|seedling|thaliana)\b",
    "drosophila": r"\b(drosophila|fruit fly)\b",
    "c elegans": r"\b(c\. elegans|caenorhabditis|nematode)\b",
}

PROMPTS = {
    "casual": PromptTemplate(
        template="""You are a space biology expert. Answer simply in 1-2 sentences.
Do NOT add information not in the context. Do NOT cite anything.
If the context doesn't help, say "I don't have enough information on that."

Context:
{context}

Question: {question}

Answer:""",
        input_variables=["context", "question"]
    ),
    "research": PromptTemplate(
        template="""You are a space biology expert. Answer using ONLY the provided context.
Do NOT add information not present in the context.

RULES:
- When context explicitly mentions a finding and an OSD-ID together, cite the OSD-ID
- Do NOT invent study titles or descriptions for OSD-IDs
- Include relevant details from context: organisms, missions, timeframes, methods
- Cite each OSD-ID only once, at the end of the relevant claim
- If the context doesn't contain enough info, say so

Context:
{context}

Question: {question}

Answer:""",
        input_variables=["context", "question"]
    ),
}


def detect_organism(question: str) -> str | None:
    """Detect which organism the question is about."""
    q_lower = question.lower()
    for org, pattern in ORGANISM_PATTERNS.items():
        if re.search(pattern, q_lower):
            return org
    return None


def load_documents() -> list[Document]:
    with open(DATA_FILE) as f:
        raw = json.load(f)
    return [Document(page_content=f"OSD-ID: {d['osd_id']}\n{d['text']}", metadata=d["metadata"]) for d in raw]


def chunk_documents(docs: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    return splitter.split_documents(docs)


def build_vectorstore(chunks: list[Document]) -> Chroma:
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    if os.path.exists(CHROMA_DIR) and os.listdir(CHROMA_DIR):
        vs = Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)
        if vs._collection.count() > 0:
            print(f"Loaded existing vectorstore ({vs._collection.count()} entries)")
            return vs
    vs = Chroma.from_documents(chunks, embeddings, persist_directory=CHROMA_DIR)
    print(f"Built new vectorstore ({vs._collection.count()} entries)")
    return vs


def create_qa_chain(vectorstore: Chroma, mode: str = "research"):
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 25})
    prompt = PROMPTS.get(mode, PROMPTS["research"])
    return RetrievalQA.from_chain_type(
        llm=llm, retriever=retriever, return_source_documents=True,
        chain_type_kwargs={"prompt": prompt}
    )


def setup_pipeline():
    docs = load_documents()
    chunks = chunk_documents(docs)
    vs = build_vectorstore(chunks)
    return create_qa_chain(vs)


def ask(qa_chain, question: str) -> dict:
    try:
        result = qa_chain.invoke(question)
        answer = result["result"]
    except Exception as e:
        return {
            "answer": f"Error generating answer: {str(e)}",
            "sources": [],
            "confidence": 0,
            "organism_detected": None
        }

    # Deduplicate sources by OSD-ID, keep diverse organisms
    seen = set()
    sources = []
    for d in result.get("source_documents", []):
        osd_id = d.metadata.get("osd_id")
        if osd_id and osd_id not in seen:
            seen.add(osd_id)
            text = d.page_content.lower()
            # Detect organism from chunk
            org = "unknown"
            if any(w in text for w in ["human", "homo sapiens", "astronaut", "inspiration4"]):
                org = "human"
            elif any(w in text for w in ["mouse", "mice", "murine", "mus musculus"]):
                org = "mouse"
            elif any(w in text for w in ["rat", "rattus"]):
                org = "rat"
            elif any(w in text for w in ["arabidopsis", "plant"]):
                org = "plant"
            sources.append({
                "osd_id": osd_id,
                "url": d.metadata.get("url"),
                "snippet": d.page_content[:200],
                "organism": org
            })

    # Detect organism from question
    organism = detect_organism(question)

    # Simple confidence based on source count
    if len(sources) >= 3:
        confidence = "high"
    elif len(sources) >= 1:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "answer": answer,
        "sources": sources,
        "confidence": confidence,
        "organism_detected": organism
    }
