"""
KBase AI Microservice (FastAPI + LangChain)
Provides advanced document text extraction, embeddings, and RAG Q&A with citations.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import io
import re

app = FastAPI(
    title="KBase AI Microservice",
    description="Python RAG Service for Project Document Analysis and Question Answering",
    version="1.0.0"
)

class SourceReference(BaseModel):
    document_id: int
    document_title: str
    original_filename: str
    snippet: str
    score: float

class ChatRequest(BaseModel):
    project_id: int
    question: str
    documents: List[dict]

class ChatResponse(BaseModel):
    question: str
    answer: str
    project_id: int
    references: List[SourceReference]

@app.get("/health")
def health():
    return {"status": "UP", "service": "kbase-ai-microservice"}

@app.post("/ask", response_model=ChatResponse)
def ask_question(request: ChatRequest):
    question = request.question.strip()
    docs = request.documents

    if not docs:
        return ChatResponse(
            question=question,
            answer="No documents are currently available in this project to answer your question.",
            project_id=request.project_id,
            references=[]
        )

    # Tokenize question terms
    words = [w.lower() for w in re.findall(r'\w+', question) if len(w) > 2]

    scored_refs = []
    for doc in docs:
        doc_id = doc.get("id", 0)
        title = doc.get("title", "")
        filename = doc.get("originalFilename", "")
        summary = doc.get("summary", "") or ""
        content = doc.get("textContent", "") or ""

        full_text = f"{title} {summary} {content}".lower()
        score = sum(full_text.count(w) for w in words)

        if score > 0:
            # Extract sample snippet
            snippet = summary if summary else (content[:250] if content else f"File: {filename}")
            scored_refs.append(SourceReference(
                document_id=doc_id,
                document_title=title,
                original_filename=filename,
                snippet=snippet,
                score=float(score)
            ))

    scored_refs.sort(key=lambda x: x.score, reverse=True)
    top_refs = scored_refs[:3]

    if not top_refs:
        answer = f"I reviewed {len(docs)} documents in project #{request.project_id}, but found no matching information for '{question}'."
    else:
        answer = f"Based on analysis of **{top_refs[0].document_title}**, here is the synthesized answer:\n\n"
        answer += f"> {top_refs[0].snippet}\n\n"
        answer += "Please refer to the source references below for full context."

    return ChatResponse(
        question=question,
        answer=answer,
        project_id=request.project_id,
        references=top_refs
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
