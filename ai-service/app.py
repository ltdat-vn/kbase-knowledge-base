"""
KBase AI Microservice (FastAPI + LangChain)
Provides advanced document text extraction, embeddings, and RAG Q&A with citations.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import io
import re
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

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
        answer = f"Tôi đã xem qua {len(docs)} tài liệu, nhưng không tìm thấy thông tin nào liên quan đến: '{question}'."
    else:
        # Xây dựng ngữ cảnh context cho OpenAI
        context_text = ""
        for idx, ref in enumerate(top_refs):
            context_text += f"[{idx+1}] Tài liệu: {ref.document_title}\nTrích xuất: {ref.snippet}\n\n"
            
        # Gọi OpenAI ChatGPT
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            answer = "⚠️ LỖI: Chưa cấu hình OPENAI_API_KEY trong máy chủ Python. Vui lòng thêm biến môi trường OPENAI_API_KEY."
        else:
            try:
                llm = ChatOpenAI(api_key=api_key, model="gpt-4o-mini", temperature=0.3)
                prompt = f"""
Bạn là Trợ lý AI chuyên môn của hệ thống KBase. Dựa vào các tài liệu ngữ cảnh dưới đây, hãy trả lời câu hỏi của người dùng bằng Tiếng Việt.
TUYỆT ĐỐI KHÔNG dùng định dạng markdown phức tạp (không dùng dấu #, *, `). Chỉ dùng gạch ngang (-) để liệt kê nếu cần.
Nếu không có thông tin trong tài liệu, hãy nói "Tôi không tìm thấy thông tin trong tài liệu".

[NGỮ CẢNH TÀI LIỆU]
{context_text}
"""
                messages = [
                    SystemMessage(content=prompt),
                    HumanMessage(content=question)
                ]
                
                response = llm.invoke(messages)
                answer = response.content
            except Exception as e:
                answer = f"Lỗi khi gọi OpenAI: {str(e)}"

    return ChatResponse(
        question=question,
        answer=answer,
        project_id=request.project_id,
        references=top_refs
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
