import os
from pathlib import Path
from dotenv import load_dotenv
from qdrant_client import QdrantClient

# Root directory se .env file ka path dhoondne ke liye
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Qdrant client connect karein
client = QdrantClient(
    url=os.getenv("QDRANT_URL"), 
    api_key=os.getenv("QDRANT_API_KEY")
)

# Saare active collections delete karein
collections = client.get_collections().collections
for c in collections:
    client.delete_collection(collection_name=c.name)
    print(f"Deleted collection: {c.name}")