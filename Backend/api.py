from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_query_handler import TextRAGHandler
import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# CORS Configuration (allow all for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Request model
class QueryRequest(BaseModel):
    query: str
    top_k: int = 200

# Initialize RAG handler
try:
    rag_handler = TextRAGHandler(
        together_api_key=os.getenv("TOGETHER_API_KEY"),
        vector_store_dir="vector_store"
    )
    print("✅ RAG handler initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize RAG handler: {e}")
    raise RuntimeError("Failed to initialize RAG handler") from e

@app.post("/query")
async def handle_query(request: QueryRequest):
    """Handle queries against MNNIT BoG documents"""
    try:
        print(f"🔍 Processing query: {request.query}")
        response = rag_handler.handle_input(request.query, request.top_k)
        return {"response": response}
    except Exception as e:
        print(f"❌ Error processing query: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Service health check"""
    return {
        "status": "healthy",
        "vector_stores": len(rag_handler.vector_stores)
    }

if __name__ == "__main__":
    # Run with auto-reload for development
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )