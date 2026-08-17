import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

UPLOAD_DIR = DATA_DIR / "uploads"
AUDIO_DIR = DATA_DIR / "audio"
FRAMES_DIR = DATA_DIR / "frames"
TRANSCRIPT_DIR = DATA_DIR / "transcripts"
TRANSCRIPTS_DIR = TRANSCRIPT_DIR  # Alias for plural import compatibility
QDRANT_PATH = DATA_DIR / "qdrant_db"  # Local Qdrant Storage Path

# Automatically create required directories
for folder in [UPLOAD_DIR, AUDIO_DIR, FRAMES_DIR, TRANSCRIPT_DIR, QDRANT_PATH]:
    folder.mkdir(parents=True, exist_ok=True)

# Qdrant Database Settings
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))

# Collection Names
TEXT_COLLECTION = "video_text_multimodal"
VISUAL_COLLECTION = "video_visual_frames"
CLIP_COLLECTION = "video_visual_frames"  # Alias

# Model Configurations
WHISPER_MODEL_SIZE = "base"  # Options: 'tiny', 'base', 'small', 'medium', 'large'
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CLIP_MODEL_NAME = "ViT-B-32"
KNOWN_FACES_DIR = DATA_DIR / "known_faces"
KNOWN_FACES_DIR.mkdir(parents=True, exist_ok=True)