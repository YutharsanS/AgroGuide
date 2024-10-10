from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')  # Choose your preferred model

class TextData(BaseModel):
    text: str

@app.post("/embed")
async def get_embedding(data: TextData):
    embedding = model.encode(data.text)
    return {"embedding": embedding.tolist()}
