import os
from pathlib import Path
import yt_dlp

from backend.app.config import UPLOAD_DIR


def download_youtube_video(url: str) -> tuple[str, str]:
    """YouTube URL se video download karta hai."""
    output_template = str(UPLOAD_DIR / "%(id)s.%(ext)s")

    ydl_opts = {
        # Format ko fully flexible rakhein
        'format': 'b/bv*+ba/best',
        'outtmpl': output_template,
        'merge_output_format': 'mp4',
        'quiet': False,
        'no_warnings': True,
        # Automatic JS runtime detect karega agar Node.js installed hai
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info['id']
        ext = info.get('ext', 'mp4')

    video_path = UPLOAD_DIR / f"{video_id}.{ext}"
    if not video_path.exists():
        video_path = UPLOAD_DIR / f"{video_id}.mp4"

    return str(video_path), video_id