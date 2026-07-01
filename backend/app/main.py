from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import ktp, formulation, research_plan, literature, ai_proxy

load_dotenv()

app = FastAPI(title="Цифровой помощник научного руководителя", version="2.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ktp.router, prefix="/api/ktp", tags=["ktp"])
app.include_router(formulation.router, prefix="/api/formulation", tags=["formulation"])
app.include_router(research_plan.router, prefix="/api/plan", tags=["plan"])
app.include_router(literature.router, prefix="/api/literature", tags=["literature"])
app.include_router(ai_proxy.router, prefix="/api/ai", tags=["ai"])


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
