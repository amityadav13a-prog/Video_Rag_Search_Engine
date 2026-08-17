from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.embeddings import get_text_embedding, get_clip_text_embedding
from backend.app.services.vector_store import search_text, search_clip
from backend.app.services.rag import generate_answer

router = APIRouter()


class SearchQuery(BaseModel):
    query: str
    top_k: int = 5


@router.post("/search")
def search(request: SearchQuery):
    text_embedding = get_text_embedding(request.query)
    text_results_raw = search_text(text_embedding, request.top_k)

    clip_embedding = get_clip_text_embedding(request.query)
    clip_results_raw = search_clip(clip_embedding, request.top_k)

    text_results = [
        {
            "timestamp": r.payload["start"],
            "text": r.payload["text"],
            "source": r.payload["source"],
            "scene": r.payload.get("scene"),
            "score": r.score
        }
        for r in text_results_raw
    ]
    visual_results = [
        {"timestamp": r.payload["start"], "score": r.score}
        for r in clip_results_raw
    ]

    answer = generate_answer(request.query, text_results)

    return {
        "answer": answer,
        "text_results": text_results,
        "visual_results": visual_results
    }