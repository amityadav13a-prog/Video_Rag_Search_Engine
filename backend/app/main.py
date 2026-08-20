from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes import upload, search, faces, history
from backend.app.services.vector_store import init_collections


# Lifespan Event Handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_collections()
    yield


app = FastAPI(
    title="Video RAG Search Engine API",
    description="Multimodal Video Search Engine using Whisper, EasyOCR, PySceneDetect, CLIP, Face Recognition, and Qdrant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration (React Frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(upload.router, prefix="/api", tags=["Upload & Processing"])
app.include_router(search.router, prefix="/api", tags=["Search Engine"])
app.include_router(faces.router, prefix="/api", tags=["Face Recognition"])
app.include_router(history.router, prefix="/api", tags=["History & Stats"])


# Root Health Check Endpoint
@app.get("/", tags=["Health Check"])
def home():
    return {
        "status": "online",
        "message": "Video RAG Search Engine API running successfully!",
    }


# Dedicated Health Check Endpoint (for pytest)
@app.get("/api/health", tags=["Health Check"])
def health_check():
    return {"status": "ok"}