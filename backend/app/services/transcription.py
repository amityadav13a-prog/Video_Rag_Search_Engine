import static_ffmpeg
static_ffmpeg.add_paths()
import ffmpeg
import whisper
from pathlib import Path
from backend.app.config import AUDIO_DIR,TRANSCRIPTS_DIR,WHISPER_MODEL_SIZE
from backend.app.services.text_cleaning import clean_text
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        _whisper_model=whisper.load_model(WHISPER_MODEL_SIZE)
    return _whisper_model

def extract_audio(video_path:str,output_audio_path:str=None)->str:
    video_path=Path(video_path)
    if output_audio_path:
        audio_path=Path(output_audio_path)
    else:
        audio_path=AUDIO_DIR/(video_path.stem+".mp3")       
    ffmpeg.input(str(video_path)).output(str(audio_path)).run(overwrite_output=True, quiet=True)
    return str(audio_path)

def format_time(seconds:float)->str:
    m=int(seconds//60)
    s=int(seconds%60)
    return f"{m:02d}:{s:02d}"

def transcribe_audio(audio_path:str,video_name:str="video")->list:
    model=get_whisper_model()
    result=model.transcribe(audio_path)

    segments=[]
    for seg in result["segments"]:
        cleaned=clean_text(seg["text"])
        if cleaned:
            start_sec=float(seg["start"])
            end_sec=float(seg.get("end", start_sec + 2.0))
            segments.append({
                "start": start_sec,
                "end": end_sec,
                "formatted_start": format_time(start_sec),
                "text": cleaned,
                "source": "speech"
            })

    path = TRANSCRIPTS_DIR / f"{video_name}_speech.txt"
    with open(path, "w", encoding="utf-8") as f:
        for seg in segments:
            f.write(f"{seg['formatted_start']}: {seg['text']}\n")

    return segments
def chunk_transcript(segments, source="speech"):
    chunks = []
    for seg in segments:
        chunks.append({
            "text": seg.get("text", "").strip(),
            "start": seg.get("start", 0),
            "end": seg.get("end", 0),
            "source": source
        })
    return chunks