from fastapi import FastAPI, APIRouter, HTTPException, Query, Response, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import re
import jwt
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'bsk-immobilier-secret-key-2025')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = hashlib.sha256("hMX181haIwKrkOhj".encode()).hexdigest()

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Auth Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: str

# Auth functions
def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

# Site Content Models
class SiteContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default="main")
    # SEO
    meta_title: str = "BSK Immobilier - Clotilde Martin | Agent Immobilier Lauzerte, Montcuq"
    meta_description: str = "Agent immobilier BSK sur Lauzerte, Montcuq et Montaigu-de-Quercy. Accompagnement personnalisé pour vendre ou acheter votre bien immobilier."
    # Hero
    hero_title: str = "Confiez votre projet immobilier à une experte locale"
    hero_subtitle: str = "Accompagnement personnalisé pour la vente de votre bien sur Lauzerte, Montcuq et Montaigu-de-Quercy"
    hero_cta_text: str = "Estimation gratuite"
    hero_image_url: str = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop"
    # Agent
    agent_section_title: str = "Votre interlocutrice dédiée"
    agent_name: str = "Clotilde Martin"
    agent_role: str = "Mandataire BSK Immobilier"
    agent_phone: str = "06 20 83 38 87"
    agent_location: str = "Bardigues (82340)"
    agent_quote: str = "VENDRE ou ACHETER un bien immobilier est un acte important et l'accompagnement d'un professionnel est nécessaire pour réussir votre projet sereinement et en toute sécurité."
    agent_photo_url: str = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
    # Sectors
    sectors_section_title: str = "Secteurs d'intervention"
    sectors_section_subtitle: str = "Expertise locale sur trois secteurs privilégiés du Tarn-et-Garonne et du Lot"
    # Form
    form_title: str = "Recevez une estimation gratuite"
    form_subtitle: str = "Réponse sous 24h par Clotilde Martin"
    form_button_text: str = "Demander un rappel"
    # Footer
    footer_tagline: str = "Réseau national d'agents mandataires"
    footer_rsac: str = "RSAC : 80951794900024 MONTAUBAN"
    footer_copyright: str = "© 2025 BSK Immobilier - Clotilde Martin. Tous droits réservés."
    # Updated
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SectorItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    description: str
    image_url: str

class SectorsUpdate(BaseModel):
    sectors: List[SectorItem]

# Lead Model
class LeadCreate(BaseModel):
    nom: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telephone: str = Field(..., min_length=10, max_length=20)
    ville: str = Field(..., min_length=2, max_length=100)
    type_bien: str

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

# Blog Models
class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    slug: str = Field(..., min_length=5, max_length=200)
    excerpt: str = Field(..., min_length=10, max_length=500)
    content: str = Field(..., min_length=50)
    category: str = Field(..., min_length=2, max_length=50)
    tags: List[str] = Field(default_factory=list)
    image_url: str = Field(default="")
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    published: bool = Field(default=True)

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    published: Optional[bool] = None

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    category: str
    tags: List[str] = Field(default_factory=list)
    image_url: str = ""
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostListResponse(BaseModel):
    posts: List[BlogPost]
    total: int
    page: int
    per_page: int
    total_pages: int

class Category(BaseModel):
    name: str
    count: int

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    if request.username == ADMIN_USERNAME and password_hash == ADMIN_PASSWORD_HASH:
        token = create_token(request.username)
        return LoginResponse(success=True, token=token, message="Connexion réussie")
    
    raise HTTPException(status_code=401, detail="Identifiants incorrects")

@api_router.get("/auth/verify")
async def verify_auth(username: str = Depends(verify_token)):
    return {"valid": True, "username": username}

# ==================== SITE CONTENT ROUTES ====================
@api_router.get("/site/content", response_model=SiteContent)
async def get_site_content():
    content = await db.site_content.find_one({"id": "main"}, {"_id": 0})
    if not content:
        # Return defaults
        default = SiteContent()
        return default
    
    if isinstance(content.get('updated_at'), str):
        content['updated_at'] = datetime.fromisoformat(content['updated_at'])
    
    return content

@api_router.put("/site/content", response_model=SiteContent)
async def update_site_content(content: SiteContent, username: str = Depends(verify_token)):
    content.id = "main"
    content.updated_at = datetime.now(timezone.utc)
    
    doc = content.model_dump()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.site_content.update_one(
        {"id": "main"},
        {"$set": doc},
        upsert=True
    )
    
    return content

@api_router.get("/site/sectors", response_model=List[SectorItem])
async def get_sectors():
    sectors = await db.sectors.find({}, {"_id": 0}).to_list(100)
    if not sectors:
        # Return defaults
        return [
            SectorItem(id="1", name="Lauzerte", code="82110", description="Cité médiévale du Tarn-et-Garonne", image_url="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop"),
            SectorItem(id="2", name="Montcuq", code="46800", description="Charmant village du Lot", image_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"),
            SectorItem(id="3", name="Montaigu-de-Quercy", code="82150", description="Au cœur du Quercy Blanc", image_url="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop")
        ]
    return sectors

@api_router.put("/site/sectors", response_model=List[SectorItem])
async def update_sectors(data: SectorsUpdate, username: str = Depends(verify_token)):
    # Clear and replace all sectors
    await db.sectors.delete_many({})
    
    if data.sectors:
        docs = [s.model_dump() for s in data.sectors]
        await db.sectors.insert_many(docs)
    
    return data.sectors

# ==================== LEADS ROUTES ====================
@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(input: LeadCreate):
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
            message="Votre demande a été enregistrée. Nous vous contacterons rapidement.",
            lead_id=lead.id
        )
    except Exception as e:
        logging.error(f"Error creating lead: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement")

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(username: str = Depends(verify_token)):
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return leads

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, username: str = Depends(verify_token)):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead non trouvé")
    return {"success": True}

# ==================== BLOG ROUTES (PUBLIC) ====================
@api_router.get("/blog/posts", response_model=BlogPostListResponse)
async def get_blog_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=50),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    published_only: bool = True
):
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    
    total = await db.blog_posts.count_documents(query)
    total_pages = (total + per_page - 1) // per_page
    skip = (page - 1) * per_page
    
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(per_page).to_list(per_page)
    
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    
    return BlogPostListResponse(posts=posts, total=total, page=page, per_page=per_page, total_pages=total_pages)

@api_router.get("/blog/posts/{slug}", response_model=BlogPost)
async def get_blog_post_by_slug(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if isinstance(post.get('created_at'), str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post.get('updated_at'), str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    
    return post

@api_router.get("/blog/categories", response_model=List[Category])
async def get_blog_categories():
    pipeline = [
        {"$match": {"published": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    categories = await db.blog_posts.aggregate(pipeline).to_list(100)
    return [Category(name=cat["_id"], count=cat["count"]) for cat in categories if cat["_id"]]

@api_router.get("/blog/recent", response_model=List[BlogPost])
async def get_recent_posts(limit: int = Query(5, ge=1, le=10)):
    posts = await db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return posts

# ==================== BLOG ROUTES (PROTECTED) ====================
@api_router.post("/blog/posts", response_model=BlogPost)
async def create_blog_post(input: BlogPostCreate, username: str = Depends(verify_token)):
    existing = await db.blog_posts.find_one({"slug": input.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Un article avec ce slug existe déjà")
    
    post = BlogPost(
        title=input.title,
        slug=input.slug,
        excerpt=input.excerpt,
        content=input.content,
        category=input.category,
        tags=input.tags,
        image_url=input.image_url,
        meta_title=input.meta_title or input.title,
        meta_description=input.meta_description or input.excerpt[:160],
        published=input.published
    )
    
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.blog_posts.insert_one(doc)
    return post

@api_router.put("/blog/posts/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, input: BlogPostUpdate, username: str = Depends(verify_token)):
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    if 'slug' in update_data and update_data['slug'] != existing['slug']:
        slug_exists = await db.blog_posts.find_one({"slug": update_data['slug'], "id": {"$ne": post_id}})
        if slug_exists:
            raise HTTPException(status_code=400, detail="Un article avec ce slug existe déjà")
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    updated = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated

@api_router.delete("/blog/posts/{post_id}")
async def delete_blog_post(post_id: str, username: str = Depends(verify_token)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return {"success": True, "message": "Article supprimé"}

# ==================== SITEMAP ====================
@api_router.get("/sitemap.xml")
async def get_sitemap():
    base_url = "https://lauzerte-immo.preview.emergentagent.com"
    posts = await db.blog_posts.find({"published": True}, {"slug": 1, "updated_at": 1, "_id": 0}).to_list(1000)
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml_content += f'  <url>\n    <loc>{base_url}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n'
    xml_content += f'  <url>\n    <loc>{base_url}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n'
    
    for post in posts:
        lastmod = post.get('updated_at', '')
        if isinstance(lastmod, str) and lastmod:
            lastmod = lastmod[:10]
        else:
            lastmod = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        xml_content += f'  <url>\n    <loc>{base_url}/blog/{post["slug"]}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    
    xml_content += '</urlset>'
    return Response(content=xml_content, media_type="application/xml")

@api_router.get("/")
async def root():
    return {"message": "BSK Immobilier API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
