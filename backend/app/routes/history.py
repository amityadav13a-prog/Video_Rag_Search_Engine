from fastapi import APIRouter, Depends
from backend.app.services.auth import get_current_user
from backend.app.services.history import get_history, get_stats

router = APIRouter()

@router.get("")
@router.get("/")
def history(user_id: str = Depends(get_current_user)):
    data = get_history(user_id)
    recent = []

    for u in data.get("uploads", []):
        recent.append({
            "type": "upload",
            "title": u["video_name"],
            "subtitle": "Video uploaded",
            "status": u["status"],
            "timestamp": u["timestamp"]
        })

    for s in data.get("searches", []):
        recent.append({
            "type": "search",
            "title": s["query"],
            "subtitle": "Search query",
            "results_count": s["results_count"],
            "top_timestamp": s.get("top_timestamp"),
            "timestamp": s["timestamp"]
        })

    recent.sort(key=lambda x: x["timestamp"], reverse=True)
    return {
        "recent_activity": recent, 
        "recent_searches": data.get("searches", [])[::-1]
    }


@router.get("/stats")
def stats(user_id: str = Depends(get_current_user)):
   #returns the stats of current user
    return get_stats(user_id)