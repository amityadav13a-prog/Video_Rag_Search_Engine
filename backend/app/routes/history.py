from fastapi import APIRouter

from backend.app.services.history import get_history, get_stats

router = APIRouter()


@router.get("/history")
def history():
    data = get_history()
    recent = []

    for u in data["uploads"]:
        recent.append({
            "type": "upload",
            "title": u["video_name"],
            "subtitle": "Video uploaded",
            "status": u["status"],
            "timestamp": u["timestamp"]
        })

    for s in data["searches"]:
        recent.append({
            "type": "search",
            "title": s["query"],
            "subtitle": "Search query",
            "results_count": s["results_count"],
            "top_timestamp": s.get("top_timestamp"),
            "timestamp": s["timestamp"]
        })

    recent.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"recent_activity": recent, "recent_searches": data["searches"][::-1]}


@router.get("/stats")
def stats():
    return get_stats()