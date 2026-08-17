from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.embeddings import get_text_embedding, get_clip_text_embedding
from backend.app.services.vector_store import search_text, search_clip
from backend.app.services.rag import generate_answer
router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5
    min_score: float = 0.20
@router.post("/search")

def search(request: SearchQuery):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        text_embedding = get_text_embedding(request.query)
        text_results_raw = search_text(text_embedding, request.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text search failed: {str(e)}")
    try:
        clip_embedding = get_clip_text_embedding(request.query)
        clip_results_raw = search_clip(clip_embedding, request.top_k)
    except Exception as e:
        clip_results_raw = []   # CLIP fail then too continiue for text

    text_results = [
        {
            "timestamp": r.payload["start"],
            "text": r.payload["text"],
            "source": r.payload["source"],
            "scene": r.payload.get("scene"),
            "score": r.score
        }
        for r in text_results_raw if r.score >= request.min_score
    ]
    visual_results = [
        {"timestamp": r.payload["start"], "score": r.score}
        for r in clip_results_raw if r.score >= request.min_score
    ]
    try:
        answer = generate_answer(request.query, text_results)
    except Exception as e:
        answer = f"Could not generate answer (LLM error): {str(e)}"
    return {
        "answer": answer,
        "text_results": text_results,
        "visual_results": visual_results
    }