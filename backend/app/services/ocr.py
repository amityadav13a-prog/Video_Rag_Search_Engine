import cv2
import easyocr
import os
from backend.app.config import TRANSCRIPTS_DIR
from backend.app.services.text_cleaning import clean_text

_reader = None


def get_ocr_reader():
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(['en'], gpu=True)
    return _reader


def parse_to_seconds(time_val) -> float:
    """String 'MM:SS', dict, timecode, ya numeric float values ko float seconds me convert karta hai."""
    try:
        if isinstance(time_val, str):
            if ":" in time_val:
                parts = time_val.split(":")
                if len(parts) == 2:
                    return float(parts[0]) * 60 + float(parts[1])
                elif len(parts) == 3:
                    return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
            return float(time_val)
        elif isinstance(time_val, dict):
            val = time_val.get("start", time_val.get("start_time", 0.0))
            return parse_to_seconds(val)
        elif hasattr(time_val, 'get_seconds'):
            return float(time_val.get_seconds())
        return float(time_val)
    except Exception:
        return 0.0


def extract_frames_ocr(video_path: str, scene_timestamps: list, output_dir: str):
    reader = get_ocr_reader()
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0

    ocr_chunks = []
    frame_data = []

    os.makedirs(output_dir, exist_ok=True)

    for idx, scene in enumerate(scene_timestamps):
        if isinstance(scene, dict):
            start_raw = scene.get("start", scene.get("start_time", 0.0))
            end_raw = scene.get("end", scene.get("end_time", 0.0))
        elif isinstance(scene, (tuple, list)):
            start_raw = scene[0]
            end_raw = scene[1] if len(scene) > 1 else 0.0
        else:
            start_raw = scene
            end_raw = 0.0

        start_sec = parse_to_seconds(start_raw)
        end_sec = parse_to_seconds(end_raw)
        if end_sec <= start_sec:
            end_sec = start_sec + 5.0

        frame_number = int(start_sec * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

        ret, frame = cap.read()
        if not ret:
            continue

        frame_name = f"scene_{idx}_{int(start_sec)}.jpg"
        frame_path = os.path.join(output_dir, frame_name)
        cv2.imwrite(frame_path, frame)

        try:
            ocr_results = reader.readtext(frame)
            texts = [res[1] for res in ocr_results if len(res) > 1]
            cleaned_ocr_text = clean_text(" ".join(texts))

            if cleaned_ocr_text:
                ocr_chunks.append({
                    "text": cleaned_ocr_text,
                    "start": start_sec,
                    "end": end_sec,
                    "source": "ocr",
                    "scene": idx
                })
        except Exception as err:
            print(f"⚠️ OCR process error at {start_sec}s: {err}")

        frame_data.append({
            "timestamp": start_sec,
            "frame_path": frame_path,
            "scene": idx
        })

    cap.release()
    return ocr_chunks, frame_data