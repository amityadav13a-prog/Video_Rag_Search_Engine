from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from backend.app.config import QDRANT_PATH, TEXT_COLLECTION, CLIP_COLLECTION
_client = None

def get_client():
    global _client
    if _client is None:
        _client=QdrantClient(path=str(QDRANT_PATH))
        init_collections()
    return _client


def init_collections():
    """Initializes collections if they don't already exist."""
    client=_client if _client else QdrantClient(path=str(QDRANT_PATH))
    existing=[c.name for c in client.get_collections().collections]
    
    if TEXT_COLLECTION not in existing:
        client.create_collection(
            collection_name=TEXT_COLLECTION,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
    if CLIP_COLLECTION not in existing:
        client.create_collection(
            collection_name=CLIP_COLLECTION,
            vectors_config=VectorParams(size=512, distance=Distance.COSINE)
        )

def upload_text_chunks(chunks: list, embeddings: list, video_name: str):
    client=get_client()
    existing_count=client.count(collection_name=TEXT_COLLECTION).count
    points=[
        PointStruct(
            id=existing_count + i,
            vector=emb,
            payload={
                "text": c["text"],
                "start": c["start"],
                "source": c["source"],
                "scene": c.get("scene"),
                "video": video_name
            }
        )
        for i, (c, emb) in enumerate(zip(chunks, embeddings))
    ]
    client.upsert(collection_name=TEXT_COLLECTION, points=points)

def upload_frame_embeddings(frames: list, video_name: str):
    client=get_client()
    existing_count=client.count(collection_name=CLIP_COLLECTION).count
    points=[
        PointStruct(
            id=existing_count + i,
            vector=f["embedding"],
            payload={"start": f["start"], "video": video_name}
        )
        for i, f in enumerate(frames)
    ]
    client.upsert(collection_name=CLIP_COLLECTION, points=points)

def search_text(query_embedding: list, top_k: int = 5):
    client=get_client()
    return client.query_points(collection_name=TEXT_COLLECTION, query=query_embedding, limit=top_k).points

def search_clip(query_embedding: list, top_k: int = 5):
    client=get_client()
    return client.query_points(collection_name=CLIP_COLLECTION, query=query_embedding, limit=top_k).points