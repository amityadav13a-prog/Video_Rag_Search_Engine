import torch
from sentence_transformers import SentenceTransformer
from PIL import Image

# Text Embedding Model (Sentence Transformers - 384 dim)
text_model = SentenceTransformer('all-MiniLM-L6-v2')

# CLIP Multimodal Model (Visual & Text - 512 dim)
clip_model = SentenceTransformer('clip-ViT-B-32')

# 1. Standard Text Embedding Function
def get_text_embedding(text: str) -> list:
    """Standard text query/chunk ke embeddings generate karta hai."""
    return text_model.encode(text).tolist()

# 2. CLIP Text Embedding Function
def get_clip_text_embedding(text: str) -> list:
    """CLIP model se text ke visual embeddings generate karta hai."""
    return clip_model.encode(text).tolist()

# 3. CLIP Image Embedding Function
def get_clip_image_embedding(image_path: str) -> list:
    """Frame/Image ke visual embeddings generate karta hai."""
    img = Image.open(image_path)
    return clip_model.encode(img).tolist()