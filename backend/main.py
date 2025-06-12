from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

class Answer(BaseModel):
    answers: Dict[str, Any]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/submit-answer")
def submit_answer(answer: Answer):
    try:
        # Here you would typically save the answers to a database
        # For now, we'll just return the answers
        return {"status": "success", "answers": answer.answers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 