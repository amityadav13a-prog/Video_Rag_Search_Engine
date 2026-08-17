from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# 1. Yahan 'faces' add kiya hai
from backend.app.routes import upload, search, faces
from backend.app.services.vector_store import init_collections

# FastAPI App Instance
app = FastAPI(
    title="Video RAG Search Engine API",
    description="Multimodal Video Search Engine using Whisper, EasyOCR, PySceneDetect, CLIP, Face Recognition, and Qdrant",
    version="1.0.0"
)

# CORS Configuration (React Frontend integration ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event: Vector Store Collections Initialise karne ke liye
@app.on_event("startup")
def startup_event():
    init_collections()

# Include Routes
app.include_router(upload.router, prefix="/api", tags=["Upload & Processing"])
app.include_router(search.router, prefix="/api", tags=["Search Engine"])
# 2. Yeh nayi line add ki hai
app.include_router(faces.router, prefix="/api", tags=["Face Recognition"])

# Root Health Check Endpoint
@app.get("/", tags=["Health Check"])
def home():
    return {
        "status": "online",
        "message": "Video RAG Search Engine API running successfully!"
    }