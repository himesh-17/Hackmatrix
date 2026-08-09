import os
import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

CHROMA_DIR = "chroma_db"
DATA_FILE = "data/osdr_documents.json"

PROMPT = """You are a space biology expert. Answer using ONLY the provided context.
If the context doesn't contain enough info, say so honestly.
Always cite which dataset (OSD-ID) your answer comes from.

Context:
{context}

Question: {question}

Answer:"""


def load_documents() -> list[Document]:
    with open(DATA_FILE) as f:
        raw = json.load(f)
    return [Document(page_content=d["text"], metadata=d["metadata"]) for d in raw]


def chunk_documents(docs: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
    return splitter.split_documents(docs)


def build_vectorstore(chunks: list[Document]) -> Chroma:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    if os.path.exists(CHROMA_DIR) and os.listdir(CHROMA_DIR):
        return Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)
    return Chroma.from_documents(chunks, embeddings, persist_directory=CHROMA_DIR)


def create_qa_chain(vectorstore: Chroma):
    llm = ChatGroq(model="llama3-8b-8192", temperature=0.1)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
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
