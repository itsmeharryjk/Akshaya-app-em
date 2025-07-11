from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import json
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models for Akshaya E-Services
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: str = "User"
    language: str = "en"  # "en" or "ml"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    phone: str
    name: str = "User"
    language: str = "en"

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    type: str  # "address_proof", "identity_proof", "income_certificate", etc.
    file_data: str  # base64 encoded file data
    auto_tagged: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DocumentCreate(BaseModel):
    name: str
    type: str
    file_data: str

class ServiceApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    service_name: str
    service_id: str
    status: str = "pending"  # "pending", "processing", "completed", "rejected"
    fee: int
    documents: List[str] = []  # Document IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceApplicationCreate(BaseModel):
    service_name: str
    service_id: str
    fee: int
    documents: List[str] = []

class NotificationMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str = "info"  # "info", "service_update", "alert"
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    token: Optional[str] = None

# Mock OTP storage (in production, use Redis or database)
otp_storage = {}

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Mock token validation - in production, use JWT
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]
    # Extract user_id from token format "token_{user_id}"
    if token.startswith("token_"):
        return token[6:]  # Remove "token_" prefix to get user_id
    return token  # Return as-is for backward compatibility

# Services data
SERVICES = [
    {
        "id": "ration_card",
        "name": "Ration Card",
        "description": "Apply for a new ration card or update existing card details",
        "fee": 100,
        "required_documents": [
            {"type": "address_proof", "name": "Address Proof", "description": "Electricity bill, water bill, or any government issued address proof"},
            {"type": "identity_proof", "name": "Identity Proof", "description": "Aadhaar card, voter ID, or any government issued identity"},
            {"type": "income_certificate", "name": "Income Certificate", "description": "Certificate issued by the revenue department"},
            {"type": "passport_photo", "name": "Passport Photo", "description": "Recent passport size photograph"}
        ]
    },
    {
        "id": "birth_certificate",
        "name": "Birth Certificate",
        "description": "Apply for birth certificate",
        "fee": 50,
        "required_documents": [
            {"type": "identity_proof", "name": "Identity Proof", "description": "Parent's identity proof"},
            {"type": "address_proof", "name": "Address Proof", "description": "Current address proof"},
            {"type": "medical_certificate", "name": "Medical Certificate", "description": "Hospital birth certificate"}
        ]
    },
    {
        "id": "income_certificate",
        "name": "Income Certificate",
        "description": "Apply for income certificate",
        "fee": 75,
        "required_documents": [
            {"type": "identity_proof", "name": "Identity Proof", "description": "Aadhaar card or voter ID"},
            {"type": "salary_certificate", "name": "Salary Certificate", "description": "Employer salary certificate"},
            {"type": "address_proof", "name": "Address Proof", "description": "Current address proof"}
        ]
    },
    {
        "id": "residence_certificate",
        "name": "Residence Certificate",
        "description": "Apply for residence certificate",
        "fee": 60,
        "required_documents": [
            {"type": "address_proof", "name": "Address Proof", "description": "Electricity bill, water bill, or rental agreement"},
            {"type": "identity_proof", "name": "Identity Proof", "description": "Aadhaar card or voter ID"}
        ]
    },
    {
        "id": "caste_certificate",
        "name": "Caste Certificate",
        "description": "Apply for caste certificate",
        "fee": 80,
        "required_documents": [
            {"type": "identity_proof", "name": "Identity Proof", "description": "Aadhaar card or voter ID"},
            {"type": "family_certificate", "name": "Family Certificate", "description": "Family register or family certificate"},
            {"type": "address_proof", "name": "Address Proof", "description": "Current address proof"}
        ]
    },
    {
        "id": "pension_scheme",
        "name": "Pension Scheme",
        "description": "Apply for pension scheme",
        "fee": 0,
        "required_documents": [
            {"type": "identity_proof", "name": "Identity Proof", "description": "Aadhaar card or voter ID"},
            {"type": "age_proof", "name": "Age Proof", "description": "Birth certificate or SSLC certificate"},
            {"type": "income_certificate", "name": "Income Certificate", "description": "Income certificate from revenue department"}
        ]
    }
]

# Authentication endpoints
@api_router.post("/auth/request-otp", response_model=AuthResponse)
async def request_otp(request: OTPRequest):
    """Request OTP for phone number"""
    otp = generate_otp()
    otp_storage[request.phone] = {
        "otp": otp,
        "timestamp": datetime.utcnow(),
        "attempts": 0
    }
    
    # In production, send SMS here
    print(f"OTP for {request.phone}: {otp}")
    
    return AuthResponse(success=True, message="OTP sent successfully")

@api_router.post("/auth/verify-otp", response_model=AuthResponse)
async def verify_otp(request: OTPVerify):
    """Verify OTP and login/register user"""
    if request.phone not in otp_storage:
        raise HTTPException(status_code=400, detail="OTP not found. Please request OTP first.")
    
    stored_otp = otp_storage[request.phone]
    
    # Check if OTP is expired (5 minutes)
    if datetime.utcnow() - stored_otp["timestamp"] > timedelta(minutes=5):
        del otp_storage[request.phone]
        raise HTTPException(status_code=400, detail="OTP expired. Please request new OTP.")
    
    # Check OTP attempts
    if stored_otp["attempts"] >= 3:
        del otp_storage[request.phone]
        raise HTTPException(status_code=400, detail="Too many attempts. Please request new OTP.")
    
    if stored_otp["otp"] != request.otp:
        otp_storage[request.phone]["attempts"] += 1
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # OTP verified, clean up
    del otp_storage[request.phone]
    
    # Check if user exists
    existing_user = await db.users.find_one({"phone": request.phone})
    
    if existing_user:
        user = User(**existing_user)
    else:
        # Create new user
        user = User(phone=request.phone)
        await db.users.insert_one(user.dict())
    
    # Generate token (in production, use JWT)
    token = f"token_{user.id}"
    
    return AuthResponse(
        success=True,
        message="Login successful",
        user_id=user.id,
        token=token
    )

# User endpoints
@api_router.get("/user/profile")
async def get_user_profile(user_id: str = Depends(get_current_user)):
    """Get user profile"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.put("/user/profile")
async def update_user_profile(profile: UserCreate, user_id: str = Depends(get_current_user)):
    """Update user profile"""
    await db.users.update_one(
        {"id": user_id},
        {"$set": profile.dict()}
    )
    return {"message": "Profile updated successfully"}

# Services endpoints
@api_router.get("/services")
async def get_services():
    """Get all available services"""
    return SERVICES

@api_router.get("/services/{service_id}")
async def get_service(service_id: str):
    """Get specific service details"""
    service = next((s for s in SERVICES if s["id"] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

# Document endpoints
@api_router.post("/documents")
async def create_document(document: DocumentCreate, user_id: str = Depends(get_current_user)):
    """Upload a document"""
    doc = Document(
        user_id=user_id,
        name=document.name,
        type=document.type,
        file_data=document.file_data,
        auto_tagged=True  # Mock auto-tagging
    )
    await db.documents.insert_one(doc.dict())
    return doc

@api_router.get("/documents", response_model=List[Document])
async def get_documents(user_id: str = Depends(get_current_user)):
    """Get all user documents"""
    documents = await db.documents.find({"user_id": user_id}).to_list(1000)
    return [Document(**doc) for doc in documents]

@api_router.get("/documents/{document_id}")
async def get_document(document_id: str, user_id: str = Depends(get_current_user)):
    """Get specific document"""
    document = await db.documents.find_one({"id": document_id, "user_id": user_id})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return Document(**document)

@api_router.delete("/documents/{document_id}")
async def delete_document(document_id: str, user_id: str = Depends(get_current_user)):
    """Delete a document"""
    result = await db.documents.delete_one({"id": document_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

# Service Application endpoints
@api_router.post("/applications")
async def create_application(application: ServiceApplicationCreate, user_id: str = Depends(get_current_user)):
    """Create a service application"""
    app = ServiceApplication(
        user_id=user_id,
        service_name=application.service_name,
        service_id=application.service_id,
        fee=application.fee,
        documents=application.documents
    )
    await db.applications.insert_one(app.dict())
    
    # Create notification for user
    notification = NotificationMessage(
        user_id=user_id,
        title="Application Submitted",
        message=f"Your {application.service_name} application has been submitted successfully. Application ID: {app.id}",
        type="service_update"
    )
    await db.notifications.insert_one(notification.dict())
    
    return app

@api_router.get("/applications", response_model=List[ServiceApplication])
async def get_applications(user_id: str = Depends(get_current_user)):
    """Get all user applications"""
    applications = await db.applications.find({"user_id": user_id}).to_list(1000)
    return [ServiceApplication(**app) for app in applications]

# Notifications endpoints
@api_router.get("/notifications", response_model=List[NotificationMessage])
async def get_notifications(user_id: str = Depends(get_current_user)):
    """Get all user notifications"""
    notifications = await db.notifications.find({"user_id": user_id}).sort("created_at", -1).to_list(1000)
    return [NotificationMessage(**notif) for notif in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user_id: str = Depends(get_current_user)):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": user_id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

# Analytics endpoints
@api_router.get("/analytics/savings")
async def get_user_savings(user_id: str = Depends(get_current_user)):
    """Get user savings analytics"""
    applications = await db.applications.find({"user_id": user_id}).to_list(1000)
    
    # Calculate mock savings
    time_saved = len(applications) * 2  # 2 hours per application
    money_saved = len(applications) * 50  # ₹50 per application
    visits_avoided = len(applications)  # 1 visit per application
    
    return {
        "time_saved": f"{time_saved}h",
        "money_saved": f"₹{money_saved}",
        "visits_avoided": visits_avoided
    }

# Payment endpoints (mock)
@api_router.post("/payments/process")
async def process_payment(payment_data: dict, user_id: str = Depends(get_current_user)):
    """Process payment (mock)"""
    # Mock payment processing
    return {
        "success": True,
        "transaction_id": str(uuid.uuid4()),
        "amount": payment_data.get("amount", 0),
        "message": "Payment processed successfully"
    }

@api_router.get("/payments/history")
async def get_payment_history(user_id: str = Depends(get_current_user)):
    """Get payment history"""
    applications = await db.applications.find({"user_id": user_id}).to_list(1000)
    
    # Mock payment history
    history = []
    for app in applications:
        history.append({
            "id": str(uuid.uuid4()),
            "service": app["service_name"],
            "amount": app["fee"],
            "date": app["created_at"].strftime("%d/%m/%Y"),
            "status": "Completed"
        })
    
    return history

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Akshaya E-Services API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()