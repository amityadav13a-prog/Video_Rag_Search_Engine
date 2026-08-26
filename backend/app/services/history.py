import json
from datetime import datetime
from pathlib import Path
from backend.app.config import DATA_DIR

HISTORY_FILE = DATA_DIR / "history.json"

if not HISTORY_FILE.exists():
    HISTORY_FILE.write_text(json.dumps({"uploads": [], "searches": []}))


def _load():
    return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))


def _save(data):
    HISTORY_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def log_upload(video_name: str, user_id: str, status: str = "processed"):
    """user id stored in Upload record"""
    data = _load()
    data["uploads"].append({
        "video_name": video_name,
        "user_id": user_id,
        "status": status,
        "timestamp": datetime.now().isoformat()
    })
    _save(data)


def log_search(query: str, user_id: str, results_count: int, top_timestamp: str = None):
    """Search record mein user_id store karta hai."""
    data = _load()
    data["searches"].append({
        "query": query,
        "user_id": user_id,
        "results_count": results_count,
        "top_timestamp": top_timestamp,
        "timestamp": datetime.now().isoformat()
    })
    _save(data)


def get_history(user_id: str):
    #returns the history of current user
    data = _load()
    user_uploads = [item for item in data["uploads"] if item.get("user_id") == user_id]
    user_searches = [item for item in data["searches"] if item.get("user_id") == user_id]
    return {"uploads": user_uploads, "searches": user_searches}


def get_stats(user_id: str):
    data = get_history(user_id)
    total_results = sum(s.get("results_count", 0) for s in data["searches"])
    return {
        "videos_uploaded": len(data["uploads"]),
        "searches_made": len(data["searches"]),
        "results_found": total_results
    }