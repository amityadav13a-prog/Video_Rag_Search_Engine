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


def log_upload(video_name: str, status: str = "processed"):
    data = _load()
    data["uploads"].append({
        "video_name": video_name,
        "status": status,
        "timestamp": datetime.now().isoformat()
    })
    _save(data)


def log_search(query: str, results_count: int, top_timestamp: str = None):
    data = _load()
    data["searches"].append({
        "query": query,
        "results_count": results_count,
        "top_timestamp": top_timestamp,
        "timestamp": datetime.now().isoformat()
    })
    _save(data)


def get_history():
    return _load()


def get_stats():
    data = _load()
    total_results = sum(s["results_count"] for s in data["searches"])
    return {
        "videos_uploaded": len(data["uploads"]),
        "searches_made": len(data["searches"]),
        "results_found": total_results
    }