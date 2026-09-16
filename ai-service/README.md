# KBase AI Microservice (Python + FastAPI)

This optional microservice provides semantic search, document ingestion, and Question-Answering (RAG) capabilities for KBase.

## Setup & Run Locally

1. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
python app.py
```
Server runs at `http://localhost:8000` with Swagger UI at `http://localhost:8000/docs`.
