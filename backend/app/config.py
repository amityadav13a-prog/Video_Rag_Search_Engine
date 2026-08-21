import os
from pathlib import Path
from dotenv import load_dotenv

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

DATA_DIR = BASE_DIR / "data"

# Directory Definitions
UPLOAD_DIR = DATA_DIR / "uploads"
AUDIO_DIR = DATA_DIR / "audio"
FRAMES_DIR = DATA_DIR / "frames"
TRANSCRIPT_DIR = DATA_DIR / "transcripts"
TRANSCRIPTS_DIR = TRANSCRIPT_DIR  # Alias for plural import compatibility
KNOWN_FACES_DIR = DATA_DIR / "known_faces"

# Qdrant Local Path
QDRANT_PATH = DATA_DIR / "qdrant_db"
QDRANT_LOCAL_PATH = str(BASE_DIR / "backend" / "qdrant_data")

# Automatically create required directories
REQUIRED_FOLDERS = [
    UPLOAD_DIR,
    AUDIO_DIR,
    FRAMES_DIR,
    TRANSCRIPT_DIR,
    KNOWN_FACES_DIR,
    QDRANT_PATH,
]

for folder in REQUIRED_FOLDERS:
    folder.mkdir(parents=True, exist_ok=True)

# Model Configurations
WHISPER_MODEL_SIZE = "base"  # Options: 'tiny', 'base', 'small', 'medium', 'large'
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CLIP_MODEL_NAME = "ViT-B-32"
CLIP_PRETRAINED = "openai"

# Qdrant Collection Names
TEXT_COLLECTION = "video_multimodal"
VISUAL_COLLECTION = "video_visual_frames"
CLIP_COLLECTION = "video_visual_frames"  # Alias for compatibility

# Qdrant Database Settings (Cloud + Local Setup)
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))

# Firebase Settings
FIREBASE_KEY_PATH = BASE_DIR / "firebase-key.json"

# Video Cleanup Settings
DELETE_VIDEO_AFTER_PROCESSING = (
    os.getenv("DELETE_VIDEO_AFTER_PROCESSING", "true").lower() == "true"
)