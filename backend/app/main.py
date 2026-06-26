from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import topics, research_plan, literature

load_dotenv()

app = FastAPI(title="Research Supervisor Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(research_plan.router, prefix="/api/research-plan", tags=["research-plan"])
app.include_router(literature.router, prefix="/api/literature", tags=["literature"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
