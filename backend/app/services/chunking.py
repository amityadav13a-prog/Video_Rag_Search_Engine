def chunk_text(text: str, chunk_size: int = 40, overlap: int = 10) -> list:
    """Bade text ko chhote overlapping pieces mein todta hai (word-count based)."""
    words = text.split()
    if len(words) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def chunk_segment(segment: dict, chunk_size: int = 40, overlap: int = 10) -> list:
    """Ek Whisper/OCR segment ko, agar bada hai, chhote chunks mein todta hai.
    Chhota hai toh wahi ek chunk ban jayega."""
    pieces = chunk_text(segment["text"], chunk_size=chunk_size, overlap=overlap)
    result = []
    for piece in pieces:
        new_seg = dict(segment)
        new_seg["text"] = piece
        result.append(new_seg)
    return result


def create_final_chunks(whisper_chunks: list, ocr_chunks: list, scene_timestamps: list = None) -> list:
    """
    upload.py pipeline ke liye main entry function:
    Whisper aur OCR chunks ko process aur split karke aggregate final chunks banata hai.
    """
    all_raw_segments = []

    # Whisper segments collect karo
    for w in whisper_chunks:
        all_raw_segments.append({
            "text": w.get("text", ""),
            "start": w.get("start", 0.0),
            "end": w.get("end", 0.0),
            "source": w.get("source", "whisper"),
            "scene": w.get("scene")
        })

    # OCR segments collect karo
    for o in ocr_chunks:
        all_raw_segments.append({
            "text": o.get("text", ""),
            "start": o.get("start", 0.0),
            "end": o.get("end", 0.0),
            "source": o.get("source", "ocr"),
            "scene": o.get("scene")
        })

    # Timestamp ke basis par sort karo
    all_raw_segments.sort(key=lambda x: x["start"])

    # Aapke chunk_segment logic se bade segments ko split karo
    final_chunks = []
    for seg in all_raw_segments:
        if seg["text"].strip():
            split_chunks = chunk_segment(seg)
            final_chunks.extend(split_chunks)

    return final_chunks