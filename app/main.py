from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from app.utils.config import settings
from app.api.nasa import router as nasa_router
from app.api.farmer import router as farmer_router
from app.api.agriculture import router as agriculture_router
from app.api.recommendations import router as recommendations_router

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "NASA-Powered Smart Agriculture Backend for farmers in Hooghly, West Bengal, India. "
        "Integrates NASA POWER, NASA GPM IMERG, and NASA SMAP Earth Observation data "
        "with farm inputs to provide transparent crop, irrigation, and rotation recommendations."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable Cross-Origin Resource Sharing (CORS) for future web/mobile UI integration
cors_origins = (
    ["*"]
    if settings.CORS_ORIGINS.strip() == "*"
    else [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular API routers (mounted at root and versioned /api/v1)
app.include_router(nasa_router)
app.include_router(nasa_router, prefix="/api/v1")
app.include_router(farmer_router)
app.include_router(farmer_router, prefix="/api/v1")
app.include_router(agriculture_router)
app.include_router(agriculture_router, prefix="/api/v1")
app.include_router(recommendations_router)
app.include_router(recommendations_router, prefix="/api/v1")


@app.get(
    "/",
    status_code=status.HTTP_200_OK,
    tags=["Root"],
    summary="Root Service Information"
)
def root():
    """Returns basic service status, active version, and documentation endpoints."""
    return {
        "project": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "description": "Smart Agriculture Recommendation Backend powered by NASA Earth Observations",
        "target_region": "Hooghly, West Bengal, India",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json"
        }
    }


@app.get(
    "/health",
    status_code=status.HTTP_200_OK,
    tags=["Health"],
    summary="Health Check"
)
def health_check():
    """Health check endpoint to verify backend status, environment, and regional coordinates."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.APP_ENV,
        "debug": settings.DEBUG,
        "target_region": {
            "name": "Hooghly, West Bengal, India",
            "default_latitude": settings.DEFAULT_LATITUDE,
            "default_longitude": settings.DEFAULT_LONGITUDE,
        },
        "services": {
            "api": "operational",
            "database": "none_required_stateless",
            "nasa_data_connectors": "configured_for_phase_2"
        }
    }
