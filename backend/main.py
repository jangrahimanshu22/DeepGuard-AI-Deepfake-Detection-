import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config.settings import settings
from backend.database.session import init_db
from backend.models.detector_factory import get_detector
from backend.api.routes.prediction import router as prediction_router
from backend.api.routes.history import router as history_router
from backend.api.routes.reports import router as reports_router
from backend.api.routes.model_info import router as model_info_router
from backend.api.routes.system import router as system_router
from backend.api.routes.developer import router as developer_router
from backend.api.routes.live import router as live_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("deepguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing DeepGuard AI database...")
    init_db()
    
    logger.info("Pre-warming Vision Transformer detection engine...")
    try:
        detector = get_detector()
        detector.load_model()
        logger.info(f"Model '{detector.model_name}' ready on device: {detector.device}")
    except Exception as e:
        logger.error(f"Warmup error (will retry upon request): {e}")

    yield
    logger.info("DeepGuard AI backend shutting down.")

app = FastAPI(
    title="DeepGuard AI — Deepfake Detection API",
    description="Vision Transformer (ViT) deepfake classification engine with Grad-CAM & Attention Rollout explainability.",
    version=settings.app.version,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(prediction_router)
app.include_router(history_router)
app.include_router(reports_router)
app.include_router(model_info_router)
app.include_router(system_router)
app.include_router(developer_router)
app.include_router(live_router)


@app.get("/")
def root():
    return {
        "app": settings.app.name,
        "version": settings.app.version,
        "status": "online",
        "docs": "/docs",
        "description": "Vision Transformer Deepfake Detection API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
