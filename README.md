# Video RAG Search Engine

A full-stack application that lets users search inside videos using natural-language queries.

The idea is simple: instead of watching an entire video to find one specific topic, upload the video and ask a question like:

> Where does the professor explain gradient descent?

The system processes the video, indexes its content, and returns relevant moments with timestamps.

---

## Features

### Video Processing

Videos are processed in the background through multiple stages:

- Audio extraction
- Whisper transcription
- OCR
- Scene detection
- Text cleaning
- Text chunking
- Text embeddings
- CLIP image embeddings
- Face detection / recognition
- Vector indexing

### Natural Language Search

Users can search using normal questions instead of exact keywords.

Example:

```text
Where is gradient descent explained?
```

The query is converted into an embedding and compared with indexed video content.

### Multimodal Search

The system can use information from different parts of a video:

```text
Speech
  +
OCR
  +
Visual Embeddings
  +
Scene Metadata
```

This makes it possible to search beyond just the spoken transcript.

### RAG

Relevant search results are passed to an LLM as context to generate a useful answer.

```text
User Query
    ↓
Query Embedding
    ↓
Qdrant Search
    ↓
Relevant Chunks
    ↓
RAG Context
    ↓
LLM
    ↓
Answer
```

### Timestamped Results

Every retrieved result keeps its original video timestamp.

Example:

```text
02:14
Gradient descent is an optimization algorithm...

06:42
The learning rate controls the step size...
```

### Authentication

Users can create accounts and sign in using Firebase Authentication.

### User-specific History

Each user has their own:

- Uploaded videos
- Search history
- Profile
- Search activity

User data is kept separate from other accounts.

---

## How It Works

### 1. Upload

The user uploads a video through the frontend.

```text
Video
  ↓
Upload API
  ↓
Background Processing
```

### 2. Processing

The backend extracts different types of information from the video.

```text
Video
 ├── Audio → Whisper → Transcript
 ├── Frames → OCR → Visible Text
 ├── Video → Scene Detection
 ├── Frames → CLIP → Visual Embeddings
 └── Video → Face Recognition
```

### 3. Indexing

The processed information is cleaned, chunked and converted into embeddings.

```text
Processed Content
       ↓
     Chunks
       ↓
   Embeddings
       ↓
     Qdrant
```

### 4. Search

The user enters a natural-language query.

```text
Query
  ↓
Embedding
  ↓
Qdrant
  ↓
Relevant Results
```

### 5. Answer Generation

Relevant results are used as context for the RAG pipeline.

```text
Relevant Results
       ↓
     Context
       ↓
       LLM
       ↓
     Answer
```

---

## Architecture

```text
                    React Frontend
                           │
                           ▼
                      FastAPI API
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      Whisper            EasyOCR       Scene Detection
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                        Chunking
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
           Text Embeddings        CLIP
                  │                 │
                  └────────┬────────┘
                           ▼
                        Qdrant
                           │
                           ▼
                        RAG / LLM
                           │
                           ▼
                  Search + Timestamps
```

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Framer Motion
- Lucide React

### Backend

- Python
- FastAPI
- OpenAI Whisper
- OpenCV
- EasyOCR
- PySceneDetect
- Sentence Transformers
- CLIP
- Qdrant

### Authentication

- Firebase Authentication

### Other

- FFmpeg
- Pytest

---

## Project Structure

```text
Video_Rag_Search_Engine/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── faces.py
│   │   │   ├── history.py
│   │   │   ├── search.py
│   │   │   └── upload.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── chunking.py
│   │   │   ├── embeddings.py
│   │   │   ├── face_recognition_service.py
│   │   │   ├── history.py
│   │   │   ├── ocr.py
│   │   │   ├── rag.py
│   │   │   ├── scene_detection.py
│   │   │   ├── text_cleaning.py
│   │   │   ├── transcription.py
│   │   │   ├── vector_store.py
│   │   │   └── youtube.py
│   │   │
│   │   ├── config.py
│   │   ├── main.py
│   │   └── __init__.py
│   │
│   ├── Procfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── UploadPage.jsx
│   │   │
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── scripts/
├── tests/
│   └── test_api.py
│
├── .gitignore
├── LICENSE
├── pytest.ini
├── README.md
└── runtime.txt
```

---

## Example

### Query

```text
Where does the professor explain gradient descent?
```

### Retrieved Results

```text
02:14
Gradient descent is an optimization algorithm...

06:42
The learning rate controls the step size...

12:30
The optimizer updates the model parameters...
```

The returned timestamps help the user quickly find the relevant section of the video.

---

## Running Locally

### Requirements

Install the following before starting:

- Python 3.10+
- Node.js
- FFmpeg
- Git

### Backend

Clone the repository:

```bash
git clone https://github.com/amityadav13a-prog/Video_Rag_Search_Engine.git
cd Video_Rag_Search_Engine
```

Create a virtual environment:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the backend:

```bash
uvicorn backend.app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Environment Variables

Create a local `.env` file for required API keys and configuration.

Example:

```env
OPENAI_API_KEY=your_api_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
FIREBASE_PROJECT_ID=your_project_id
```

Never commit:

```text
.env
API keys
Private credentials
Service account files
```

to GitHub.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API status |
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload a video |
| GET | `/api/status/{video_name}` | Check processing status |
| POST | `/api/search` | Search video content |
| GET | `/api/history` | Get user search history |
| `/api/...` | Face APIs | Face-related operations |

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

## Authentication

Firebase Authentication is used for user sign-in and account management.

The backend associates application data with the authenticated user.

Example:

```text
User A
 ├── Videos
 ├── Searches
 └── History

User B
 ├── Videos
 ├── Searches
 └── History
```

Each user only sees their own application data.

---

## Testing

Run the test suite with:

```bash
pytest
```

Tests are located in:

```text
tests/
```

---

## Current Status

The project currently includes:

- Video upload
- YouTube URL ingestion
- Background processing
- Whisper transcription
- OCR
- Scene detection
- Text embeddings
- CLIP embeddings
- Qdrant vector search
- RAG
- Face recognition
- Firebase authentication
- User-specific history
- React frontend
- FastAPI backend

---

## Future Improvements

Some possible improvements:

- Multi-video search
- Clickable timestamps
- Video previews in search results
- Improved multimodal ranking
- Faster background processing
- Redis / Celery based task queues
- Cloud object storage
- Production monitoring

---

## Why I Built This

Most video platforms are made mainly for watching.

I wanted to explore whether video content could be searched more like a document.

That led to combining:

```text
Speech Recognition
        +
OCR
        +
Computer Vision
        +
Embeddings
        +
Vector Search
        +
RAG
```

into a single application.

---

## Author

**Amit Yadav**

AI / ML • Full-Stack Development • RAG • Computer Vision

---

## License

This project is licensed under the MIT License.
