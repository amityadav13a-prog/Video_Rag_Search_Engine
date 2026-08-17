import os
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException

from backend.app.config import UPLOAD_DIR, AUDIO_DIR, FRAMES_DIR
from backend.app.services.transcription import extract_audio, transcribe_audio
from backend.app.services.ocr import extract_frames_ocr
from backend.app.services.scene_detection import detect_scenes
from backend.app.services.chunking import create_final_chunks
from backend.app.services.embeddings import get_text_embedding, get_clip_image_embedding
from backend.app.services.vector_store import upload_text_chunks, upload_frame_embeddings
from backend.app.services.face_recognition_service import detect_faces_in_video

router = APIRouter()

# Allowed video extensions
ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}

# In-memory status tracker
processing_status = {}


def process_video_pipeline(video_path: str, filename: str):
    """Background pipeline to process audio, OCR, scenes, face recognition & embeddings."""
    try:
        processing_status[filename] = {"status": "processing", "step": "extracting audio"}

        # 1. Extract Audio
        audio_path = os.path.join(AUDIO_DIR, f"{filename}.wav")
        extract_audio(video_path, audio_path)

        # 2. Transcribe Audio using Whisper
        processing_status[filename]["step"] = "transcribing speech"
        whisper_chunks = transcribe_audio(audio_path, video_name=filename)

        # 3. Detect Scenes using PySceneDetect
        processing_status[filename]["step"] = "detecting scenes"
        scene_timestamps = detect_scenes(video_path)

        # 4. Extract OCR text & Frame data
        processing_status[filename]["step"] = "running OCR"
        ocr_chunks, frame_data = extract_frames_ocr(video_path, scene_timestamps, FRAMES_DIR)

        # 5. Create Final Scene-Aware Chunks
        processing_status[filename]["step"] = "creating text chunks"
        final_chunks = create_final_chunks(whisper_chunks, ocr_chunks, scene_timestamps)

        # 6. Generate Text Embeddings & Push to Qdrant
        processing_status[filename]["step"] = "generating text embeddings"
        if final_chunks:
            text_embeddings = [get_text_embedding(c["text"]) for c in final_chunks]
            upload_text_chunks(final_chunks, text_embeddings, filename)

        # 7. Visual Frame Embeddings & Push to Qdrant
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

        # 8. Detect Faces in Video
        processing_status[filename]["step"] = "detecting faces"
        face_results = detect_faces_in_video(str(video_path), interval_seconds=5)

        # Status Update on Success
        processing_status[filename] = {
            "status": "completed",
            "speech_chunks": len(whisper_chunks),
            "ocr_chunks": len(ocr_chunks),
            "scenes_detected": len(scene_timestamps),
            "final_chunks": len(final_chunks),
            "frames_indexed": len(frame_data),
            "faces_detected": len(face_results)
        }

    except Exception as e:
        processing_status[filename] = {"status": "failed", "error": str(e)}


@router.post("/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # 1. Extension Validation (File save karne se pehle)
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. File Save to Disk
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Queue Background Processing
    processing_status[file.filename] = {"status": "queued"}
    background_tasks.add_task(process_video_pipeline, file_path, file.filename)

    return {
        "message": "Video uploaded, processing started in background",
        "video_name": file.filename,
        "status_check_url": f"/api/status/{file.filename}"
    }


@router.get("/status/{video_name}")
def get_status(video_name: str):
    return processing_status.get(video_name, {"status": "not found"})