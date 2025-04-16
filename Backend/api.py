from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_query_handler import TextRAGHandler
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]
)

class QueryRequest(BaseModel):
    query: str
    top_k: int = 200

# Initialize RAG handler
rag_handler = TextRAGHandler(
    together_api_key=os.getenv("TOGETHER_API_KEY"),
    vector_store_dir="vector_store"
)

@app.post("/query")
async def handle_query(request: QueryRequest):
    try:
        response = rag_handler.handle_input(request.query, request.top_k)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))