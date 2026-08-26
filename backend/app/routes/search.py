from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.app.services.embeddings import get_text_embedding, get_clip_text_embedding
from backend.app.services.vector_store import search_text, search_clip
from backend.app.services.rag import generate_answer
# Auth and History services
from backend.app.services.auth import get_current_user
from backend.app.services.history import log_search

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    top_k: int = 5
    min_score: float = 0.20

def format_timestamp(seconds) -> str:
    """Seconds ko seedha 'MM:SS' format mein convert karta hai."""
    if seconds is None:
        return "00:00"
    try:
        seconds_float = float(seconds)
    except (ValueError, TypeError):
        return "00:00"
        
    mins = int(seconds_float // 60)
    secs = int(seconds_float % 60)
    return f"{mins:02d}:{secs:02d}"

@router.post("")
@router.post("/")
def search(
    request: SearchQuery,
    user_id: str = Depends(get_current_user)
):
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
        clip_results_raw = []

    # ⏱️ Ab timestamp ke andar seedha 'MM:SS' string jayegi (jaise "01:25")
    text_results = [
        {
            "timestamp": format_timestamp(r.payload["start"]),
            "text": r.payload["text"],
            "source": r.payload["source"],
            "scene": r.payload.get("scene"),
            "score": r.score
        }
        for r in text_results_raw if r.score >= request.min_score
    ]

    visual_results = [
        {
            "timestamp": format_timestamp(r.payload["start"]),
            "score": r.score
        }
        for r in clip_results_raw if r.score >= request.min_score
    ]

    try:
        answer = generate_answer(request.query, text_results)
    except Exception as e:
        answer = f"Could not generate answer (LLM error): {str(e)}"

    total_results = len(text_results) + len(visual_results)
    top_timestamp = text_results[0]["timestamp"] if text_results else None
    
    log_search(
        query=request.query,
        user_id=user_id,
        results_count=total_results,
        top_timestamp=top_timestamp
    )

    return {
        "answer": answer,
        "text_results": text_results,
        "visual_results": visual_results
    }