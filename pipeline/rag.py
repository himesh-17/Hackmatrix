import os
import json
import time
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_core.embeddings import Embeddings

CHROMA_DIR = "chroma_db"
DATA_FILE = "data/osdr_documents.json"

PROMPT = """You are a space biology expert specializing in NASA spaceflight research. 
Answer the question using the provided context below. Be specific and detailed.

RULES:
- Always cite the OSD-ID dataset in your answer (e.g., "According to OSD-326...")
- Reference specific findings, genes, proteins, or pathways mentioned in the context
- If multiple datasets support your answer, cite all of them
- Only say "not enough information" if the context is completely unrelated to the question

Context:
{context}

Question: {question}

Answer (include OSD-ID citations):"""


def load_documents() -> list[Document]:
    with open(DATA_FILE) as f:
        raw = json.load(f)
    return [Document(page_content=d["text"], metadata=d["metadata"]) for d in raw]


def chunk_documents(docs: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    return splitter.split_documents(docs)


def build_vectorstore(chunks: list[Document]) -> Chroma:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    # Check if vectorstore exists and has data
    if os.path.exists(CHROMA_DIR) and os.listdir(CHROMA_DIR):
        vs = Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)
        if vs._collection.count() > 0:
            print(f"Loaded existing vectorstore ({vs._collection.count()} entries)")
            return vs
    # Build new vectorstore in batches to avoid rate limits (free tier = 100/min)
    BATCH = 50
    vs = None
    for i in range(0, len(chunks), BATCH):
        batch = chunks[i : i + BATCH]
        if vs is None:
            vs = Chroma.from_documents(batch, embeddings, persist_directory=CHROMA_DIR)
        else:
            vs.add_documents(batch)
        print(f"Embedded {min(i + BATCH, len(chunks))}/{len(chunks)} chunks")
        if i + BATCH < len(chunks):
            time.sleep(65)  # respect rate limit
    print(f"Built new vectorstore ({vs._collection.count()} entries)")
    return vs


def create_qa_chain(vectorstore: Chroma):
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 6})
    prompt = PromptTemplate(template=PROMPT, input_variables=["context", "question"])
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
    result = qa_chain.invoke(question)
    sources = [
        {"osd_id": d.metadata.get("osd_id"), "url": d.metadata.get("url"),
         "snippet": d.page_content[:200]}
        for d in result["source_documents"]
    ]
    return {"answer": result["result"], "sources": sources}
