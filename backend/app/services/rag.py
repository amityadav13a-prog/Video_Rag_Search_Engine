import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

ENV_PATH = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

_groq_client = None


def get_groq_client():
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in .env file")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


def build_context(text_results: list) -> str:
    pieces = []
    for r in text_results:
        scene_info = f", Scene {r['scene']}" if r.get("scene") else ""
        pieces.append(f"[{r['timestamp']}{scene_info}] ({r['source']}) {r['text']}")
    return "\n".join(pieces)


def build_prompt(query: str, context: str) -> str:
    return f"""You are a helpful assistant that answers questions based on a video's transcript and slide text.

Context (from the video):
{context}

Question: {query}

Instructions:
- Answer using ONLY the information in the context above.
- Mention the relevant timestamp in your answer.
- If the context doesn't contain the answer, say "sorry, I don't have enough information to answer that question."
- Keep the answer concise (2-4 sentences).

Answer:"""


def generate_answer(query: str, text_results: list) -> str:
    if not text_results:
        return "No relevant content found in the video for this query."

    context = build_context(text_results)
    prompt = build_prompt(query, context)

    client = get_groq_client()

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",  # Aapki active model list se exact name
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content