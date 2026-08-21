import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from backend.app.config import (
    QDRANT_URL,
    QDRANT_API_KEY,
    QDRANT_PATH,
    QDRANT_LOCAL_PATH,
    TEXT_COLLECTION,
    CLIP_COLLECTION,
)

_client = None


def get_client() -> QdrantClient:
    """Singleton instance manager for Qdrant client."""
    global _client
    if _client is None:
        if QDRANT_URL and QDRANT_API_KEY:
            # Production: Qdrant Cloud connection
            _client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        else:
            # Local Development Fallback
            local_storage = QDRANT_PATH if QDRANT_PATH else QDRANT_LOCAL_PATH
            _client = QdrantClient(path=str(local_storage))

        init_collections(_client)
    return _client


def init_collections(client: QdrantClient = None):
    """Ensures vector collections exist with correct vector dimensions."""
    if client is None:
        client = get_client()

    existing = [c.name for c in client.get_collections().collections]

    if TEXT_COLLECTION not in existing:
        client.create_collection(
            collection_name=TEXT_COLLECTION,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

    if CLIP_COLLECTION not in existing:
        client.create_collection(
            collection_name=CLIP_COLLECTION,
            vectors_config=VectorParams(size=512, distance=Distance.COSINE),
        )


def upload_text_chunks(chunks: list, embeddings: list, video_name: str):
    """Uploads text vector embeddings alongside chunk payloads to Qdrant."""
    client = get_client()
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=emb,
            payload={
                "text": c.get("text", ""),
                "start": c.get("start", "00:00"),
                "source": c.get("source", "speech"),
                "scene": c.get("scene"),
                "video": video_name,
            },
        )
        for c, emb in zip(chunks, embeddings)
    ]
    client.upsert(collection_name=TEXT_COLLECTION, points=points)


def upload_frame_embeddings(frames: list, video_name: str):
    """Uploads CLIP visual frame embeddings to Qdrant."""
    client = get_client()
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=f["embedding"],
            payload={
                "start": f.get("start") or f.get("timestamp", "00:00"),
                "video": video_name,
            },
        )
        for f in frames
    ]
    client.upsert(collection_name=CLIP_COLLECTION, points=points)


def search_text(query_embedding: list, top_k: int = 5):
    """Searches similar text chunks using query vector embedding."""
    client = get_client()
    return client.query_points(
        collection_name=TEXT_COLLECTION, query=query_embedding, limit=top_k
    ).points


def search_clip(query_embedding: list, top_k: int = 5):
    """Searches similar visual frames using query vector embedding."""
    client = get_client()
    return client.query_points(
        collection_name=CLIP_COLLECTION, query=query_embedding, limit=top_k
    ).points