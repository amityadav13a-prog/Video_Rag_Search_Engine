import os
import shutil
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from backend.app.config import UPLOAD_DIR, AUDIO_DIR, TRANSCRIPT_DIR, FRAMES_DIR
from backend.app.services.transcription import extract_audio, transcribe_audio
from backend.app.services.ocr import extract_frames_ocr
from backend.app.services.scene_detection import detect_scenes
from backend.app.services.chunking import create_final_chunks
from backend.app.services.embeddings import get_text_embedding, get_clip_image_embedding
from backend.app.services.vector_store import upload_text_chunks, upload_frame_embeddings

router = APIRouter()

def process_video_pipeline(video_path: str, filename: str):
    """Background task to run video processing pipeline."""
    try:
        print(f"🎬 Starting processing for: {filename}")

        # 1. Extract Audio
        audio_path = os.path.join(AUDIO_DIR, f"{filename}.wav")
        extract_audio(video_path, audio_path)

        # 2. Transcribe Audio using Whisper
        whisper_chunks = transcribe_audio(audio_path)
        print(f"🎙️ Audio Transcribed: {len(whisper_chunks)} segments")

        # 3. Detect Scenes using PySceneDetect
        scene_timestamps = detect_scenes(video_path)
        print(f"📸 Scenes Detected: {len(scene_timestamps)}")

        # 4. Extract OCR text & Frame embeddings
        ocr_chunks, frame_data = extract_frames_ocr(video_path, scene_timestamps, FRAMES_DIR)
        print(f"🔍 OCR Chunks: {len(ocr_chunks)}, Frames Extracted: {len(frame_data)}")

        # 5. Create Merged & Scene-aware Final Chunks
        final_chunks = create_final_chunks(whisper_chunks, ocr_chunks, scene_timestamps)
        print(f"🧩 Final Chunks Created: {len(final_chunks)}")

        # 6. Generate Text Embeddings & Push to Qdrant
        if final_chunks:
            text_embeddings = [get_text_embedding(c["text"]) for c in final_chunks]
            upload_text_chunks(final_chunks, text_embeddings, filename)
            print("✅ Text embeddings uploaded to Qdrant!")

        # 7. Generate Visual Frame Embeddings & Push to Qdrant
        if frame_data:
            frame_embeddings = []
            for frame in frame_data:
                emb = get_clip_image_embedding(frame["frame_path"])
                frame_embeddings.append({
                    "start": frame["timestamp"],
                    "embedding": emb
                })
            upload_frame_embeddings(frame_embeddings, filename)
            print("✅ Visual embeddings uploaded to Qdrant!")

        print(f"🎉 Processing completed successfully for {filename}!")

    except Exception as e:
        print(f"❌ Error during pipeline execution: {str(e)}")


@router.post("/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """API endpoint to upload video and start pipeline processing."""
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Trigger background processing task so UI doesn't hang
        background_tasks.add_task(process_video_pipeline, file_path, file.filename)

        return {
            "status": "success",
            "filename": file.filename,
            "message": "Video uploaded! Processing started in background."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))