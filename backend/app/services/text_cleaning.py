import re


def clean_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)              # multiple spaces -> ek space
    text = re.sub(r'([!?.])\1+', r'\1', text)      # repeated punctuation fix
    return text