"""
Production Security Middleware
"""
import os
from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.sessions import SessionMiddleware
import time
from collections import defaultdict
from typing import Dict

# Rate limiting storage (in production, use Redis)
request_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

class SecurityMiddleware:
    def __init__(self, app):
        self.app = app
        self.rate_limit_window = int(os.getenv('RATE_LIMIT_WINDOW_MS', 900000)) // 1000  # Convert to seconds
        self.rate_limit_max = int(os.getenv('RATE_LIMIT_MAX_REQUESTS', 100))
        
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Rate limiting
            client_ip = self.get_client_ip(request)
            current_time = int(time.time())
            window_start = current_time - self.rate_limit_window
            
            # Clean old entries
            for ip in list(request_counts.keys()):
                request_counts[ip] = {
                    timestamp: count for timestamp, count in request_counts[ip].items()
                    if int(timestamp) > window_start
                }
            
            # Count requests in current window
            total_requests = sum(request_counts[client_ip].values())
            
            if total_requests >= self.rate_limit_max:
                response = HTTPException(
                    status_code=429,
                    detail="Too many requests. Please try again later."
                )
                await response(scope, receive, send)
                return
            
            # Increment request count
            request_counts[client_ip][str(current_time)] += 1
        
        await self.app(scope, receive, send)
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

def add_security_headers(app):
    """Add security headers to responses"""
    
    @app.middleware("http")
    async def security_headers(request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://us.i.posthog.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' https://us.i.posthog.com; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp
        
        return response

def configure_cors(app):
    """Configure CORS for production"""
    allowed_origins = os.getenv('CORS_ORIGIN', '*').split(',')
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"]
    )

def configure_trusted_hosts(app):
    """Configure trusted hosts"""
    if os.getenv('NODE_ENV') == 'production':
        allowed_hosts = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=allowed_hosts
        )