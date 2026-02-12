from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

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

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Lead Model for contact form
class LeadCreate(BaseModel):
    nom: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telephone: str = Field(..., min_length=10, max_length=20)
    ville: str = Field(..., min_length=2, max_length=100)
    type_bien: str = Field(..., description="Type de bien: Maison, Appartement, Terrain, Autre bâtiment")

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    email: str
    telephone: str
    ville: str
    type_bien: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="nouveau")

class LeadResponse(BaseModel):
    success: bool
    message: str
    lead_id: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "BSK Immobilier API - Clotilde Martin"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Lead endpoints
@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(input: LeadCreate):
    """Créer une nouvelle demande de rappel"""
    try:
        lead = Lead(
            nom=input.nom,
            email=input.email,
            telephone=input.telephone,
            ville=input.ville,
            type_bien=input.type_bien
        )
        
        doc = lead.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.leads.insert_one(doc)
        
        return LeadResponse(
            success=True,
            message="Votre demande a été enregistrée. Clotilde Martin vous contactera rapidement.",
            lead_id=lead.id
        )
    except Exception as e:
        logging.error(f"Error creating lead: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement de votre demande")

@api_router.get("/leads", response_model=List[Lead])
async def get_leads():
    """Récupérer toutes les demandes de rappel"""
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    
    return leads

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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
