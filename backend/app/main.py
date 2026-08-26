import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = ""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import firebase_admin
from app.routes import upload, search, faces, history
from app.services.vector_store import init_collections

try:
    firebase_admin.get_app()
except ValueError:
    cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    if os.path.exists(cred_path):
        from firebase_admin import credentials
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app(options={
            'projectId': 'video-rag-search-engine'
        })


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_collections()
    yield


app = FastAPI(
    title="Video RAG Search Engine API",
    description="Multimodal Video Search Engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All Route Prefixes Aligned
app.include_router(upload.router, prefix="/api/upload", tags=["Upload & Processing"])
app.include_router(search.router, prefix="/api/search", tags=["Search Engine"])
app.include_router(faces.router, prefix="/api/faces", tags=["Face Recognition"])
app.include_router(history.router, prefix="/api/history", tags=["History & Stats"])


@app.get("/", tags=["Health Check"])
def home():
    return {
        "status": "online",
        "message": "Video RAG Search Engine API running successfully!",
    }


@app.get("/api/health", tags=["Health Check"])
def health_check():
    return {"status": "ok"}