import yt_dlp
from pathlib import Path

from backend.app.config import UPLOAD_DIR


def download_youtube_video(url: str) -> tuple[str, str]:
    """YouTube URL se video download karta hai. Returns (video_path, video_name)."""
    output_template = str(UPLOAD_DIR / "%(id)s.%(ext)s")

    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': output_template,
        'quiet': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info['id']
        ext = info.get('ext', 'mp4')

    video_path = UPLOAD_DIR / f"{video_id}.{ext}"
    return str(video_path), video_id