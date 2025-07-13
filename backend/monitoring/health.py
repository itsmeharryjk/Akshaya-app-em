"""
Health Check and Monitoring Endpoints
"""
from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
import psutil
from datetime import datetime
from typing import Dict, Any

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "akshaya-e-services-api"
    }

@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with system metrics"""
    try:
        # Database connectivity check
        mongo_url = os.environ.get('MONGO_URL')
        if mongo_url:
            client = AsyncIOMotorClient(mongo_url)
            await client.admin.command('ping')
            db_status = "connected"
            client.close()
        else:
            db_status = "not_configured"
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "akshaya-e-services-api",
            "version": "1.0.0",
            "environment": os.getenv('NODE_ENV', 'development'),
            "database": {
                "status": db_status,
                "type": "mongodb"
            },
            "system": {
                "cpu_percent": cpu_percent,
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent
                },
                "disk": {
                    "total": disk.total,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100
                }
            },
            "uptime": time.time()
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Health check failed: {str(e)}"
        )

@router.get("/metrics")
async def get_metrics():
    """Prometheus-style metrics endpoint"""
    try:
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        metrics = f"""
# HELP akshaya_cpu_usage_percent CPU usage percentage
# TYPE akshaya_cpu_usage_percent gauge
akshaya_cpu_usage_percent {cpu_percent}

# HELP akshaya_memory_usage_percent Memory usage percentage
# TYPE akshaya_memory_usage_percent gauge
akshaya_memory_usage_percent {memory.percent}

# HELP akshaya_memory_total_bytes Total memory in bytes
# TYPE akshaya_memory_total_bytes gauge
akshaya_memory_total_bytes {memory.total}

# HELP akshaya_memory_available_bytes Available memory in bytes
# TYPE akshaya_memory_available_bytes gauge
akshaya_memory_available_bytes {memory.available}
"""
        return metrics.strip()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Metrics collection failed: {str(e)}"
        )