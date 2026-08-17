import face_recognition
import cv2
import numpy as np
from pathlib import Path
from backend.app.config import KNOWN_FACES_DIR

def load_known_faces()->tuple:
  #encoding by known faces
    known_encodings=[]
    known_names=[]
    for image_path in Path(KNOWN_FACES_DIR).glob("*.*"):
        if image_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
            continue

        image = face_recognition.load_image_file(str(image_path))
        encodings = face_recognition.face_encodings(image)

        if encodings:
            known_encodings.append(encodings[0])
            known_names.append(image_path.stem)

    return known_encodings, known_names


def format_time(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


def detect_faces_in_video(video_path: str, interval_seconds: int = 5, tolerance: float = 0.5) -> list:
    known_encodings, known_names = load_known_faces()

    if not known_encodings:
        return []  
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    frame_count = 0
    results = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % int(fps*interval_seconds)==0:
            timestamp=frame_count/fps
            rgb_frame=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            face_locations=face_recognition.face_locations(rgb_frame)
            face_encodings=face_recognition.face_encodings(rgb_frame, face_locations)

            for encoding in face_encodings:
                matches=face_recognition.compare_faces(known_encodings, encoding, tolerance=tolerance)
                face_distances=face_recognition.face_distance(known_encodings, encoding)

                if True in matches:
                    best_match_index=np.argmin(face_distances)
                    name=known_names[best_match_index]
                    results.append({
                        "start":format_time(timestamp),
                        "person":name
                    })
        frame_count += 1
    cap.release()
    return results