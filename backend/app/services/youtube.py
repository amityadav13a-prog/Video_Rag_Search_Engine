import os
from pathlib import Path
import yt_dlp
from backend.app.config import UPLOAD_DIR


def download_youtube_video(url: str) -> tuple[str, str]:
    #downlode video from yt link.
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    output_template = str(UPLOAD_DIR/"%(id)s.%(ext)s")

    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': output_template,
        'merge_output_format': 'mp4',
        'quiet': False,
        'no_warnings': True,
        'nocheckcertificate': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info['id']

    # Dynamic Path Search
    matched_files = list(UPLOAD_DIR.glob(f"{video_id}.*"))
    if matched_files:
        video_path = matched_files[0]
    else:
        raise FileNotFoundError(f"Downloaded video for ID {video_id} not found in {UPLOAD_DIR}")

    return str(video_path), video_id