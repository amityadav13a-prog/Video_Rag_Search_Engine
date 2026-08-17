from fastapi import APIRouter, UploadFile, File
import shutil
from backend.app.config import KNOWN_FACES_DIR
router = APIRouter()
@router.post("/faces/add")
async def add_known_face(name: str, file: UploadFile = File(...)):
#adiing known face along with name
    extension = file.filename.split(".")[-1]
    save_path = KNOWN_FACES_DIR / f"{name}.{extension}"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Face for '{name}' added successfully"}