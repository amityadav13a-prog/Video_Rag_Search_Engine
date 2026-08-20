import os
import shutil
import cv2
from PIL import Image
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from pydantic import BaseModel

from backend.app.config import UPLOAD_DIR, AUDIO_DIR, FRAMES_DIR, DELETE_VIDEO_AFTER_PROCESSING
from backend.app.services.transcription import extract_audio, transcribe_audio
from backend.app.services.ocr import extract_frames_ocr
from backend.app.services.scene_detection import detect_scenes
from backend.app.services.chunking import create_final_chunks
from backend.app.services.embeddings import get_text_embedding, get_clip_image_embedding
from backend.app.services.vector_store import upload_text_chunks, upload_frame_embeddings
from backend.app.services.face_recognition_service import detect_faces_in_video
from backend.app.services.youtube import download_youtube_video
from backend.app.services.history import log_upload

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
processing_status = {}

class YouTubeRequest(BaseModel):
    url: str

def extract_frames(video_path: str, interval_seconds: int = 5):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    frame_count = 0
    frames = []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % int(fps * interval_seconds) == 0:
            timestamp = frame_count / fps
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb)
            m = int(timestamp // 60)
            s = int(timestamp % 60)
            frames.append({"image": pil_image, "start": f"{m:02d}:{s:02d}"})
        frame_count += 1
        
    cap.release()
    return frames

def process_video_pipeline(video_path: str, filename: str):
    """Background pipeline to process audio, OCR, scenes, face recognition & embeddings."""
    audio_path = os.path.join(AUDIO_DIR, f"{filename}.wav")
    try:
        processing_status[filename] = {"status": "processing", "step": "extracting audio"}
        extract_audio(video_path, audio_path)

        processing_status[filename]["step"] = "transcribing speech"
        whisper_chunks = transcribe_audio(audio_path, video_name=filename)
  
        processing_status[filename]["step"] = "detecting scenes"
        scene_timestamps = detect_scenes(video_path)

        processing_status[filename]["step"] = "running OCR"
        ocr_chunks, frame_data = extract_frames_ocr(video_path, scene_timestamps, FRAMES_DIR)

        processing_status[filename]["step"] = "creating text chunks"
        final_chunks = create_final_chunks(whisper_chunks, ocr_chunks, scene_timestamps)

        processing_status[filename]["step"] = "generating text embeddings"
        if final_chunks:
            text_embeddings = [get_text_embedding(c["text"]) for c in final_chunks]
            upload_text_chunks(final_chunks, text_embeddings, filename)

        processing_status[filename]["step"] = "generating visual embeddings"
        if frame_data:
            frame_embeddings = []
            for frame in frame_data:
                emb = get_clip_image_embedding(frame["frame_path"])
                frame_embeddings.append({
                    "start": frame["timestamp"],
                    "embedding": emb
                })
            upload_frame_embeddings(frame_embeddings, filename)

        processing_status[filename]["step"] = "detecting faces"
        face_results = detect_faces_in_video(str(video_path), interval_seconds=5)

        processing_status[filename] = {
            "status": "completed",
            "speech_chunks": len(whisper_chunks),
            "ocr_chunks": len(ocr_chunks),
            "scenes_detected": len(scene_timestamps),
            "final_chunks": len(final_chunks),
            "frames_indexed": len(frame_data),
            "faces_detected": len(face_results)
        }

        log_upload(filename, status="completed")

        # Video & Audio Auto-Cleanup
        if DELETE_VIDEO_AFTER_PROCESSING:
            if os.path.exists(video_path):
                os.remove(video_path)
            if os.path.exists(audio_path):
                os.remove(audio_path)

    except Exception as e:
        processing_status[filename] = {"status": "failed", "error": str(e)}
        log_upload(filename, status="failed")

        # Cleanup on Error
        if DELETE_VIDEO_AFTER_PROCESSING:
            if os.path.exists(video_path):
                os.remove(video_path)
            if os.path.exists(audio_path):
                os.remove(audio_path)

@router.post("/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    processing_status[file.filename] = {"status": "queued"}
    background_tasks.add_task(process_video_pipeline, file_path, file.filename)

    return {
        "message": "Video uploaded, processing started in background",
        "video_name": file.filename,
        "status_check_url": f"/api/status/{file.filename}"
    }

@router.post("/upload/youtube")
async def upload_youtube_video(request: YouTubeRequest, background_tasks: BackgroundTasks):
    """YouTube URL se video download karke process karta hai."""
    try:
        video_path, video_name = download_youtube_video(request.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {str(e)}")

    processing_status[video_name] = {"status": "queued"}
    background_tasks.add_task(process_video_pipeline, video_path, video_name)

    return {
        "message": "YouTube video downloaded, processing started in background",
        "video_name": video_name,
        "status_check_url": f"/api/status/{video_name}"
    }

@router.get("/status/{video_name}")
def get_status(video_name: str):
    return processing_status.get(video_name, {"status": "not found"})