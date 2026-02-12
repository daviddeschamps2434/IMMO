from fastapi import FastAPI, APIRouter, HTTPException, Query, Response
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
import re

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

# Helper function to create slug
def create_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[àáâãäå]', 'a', slug)
    slug = re.sub(r'[èéêë]', 'e', slug)
    slug = re.sub(r'[ìíîï]', 'i', slug)
    slug = re.sub(r'[òóôõö]', 'o', slug)
    slug = re.sub(r'[ùúûü]', 'u', slug)
    slug = re.sub(r'[ç]', 'c', slug)
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

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

# Blog endpoints
@api_router.get("/blog/posts", response_model=BlogPostListResponse)
async def get_blog_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=50),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    published_only: bool = True
):
    """Récupérer les articles de blog avec pagination"""
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
    
    return BlogPostListResponse(
        posts=posts,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@api_router.get("/blog/posts/{slug}", response_model=BlogPost)
async def get_blog_post_by_slug(slug: str):
    """Récupérer un article par son slug"""
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    
    if not post:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if isinstance(post.get('created_at'), str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post.get('updated_at'), str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    
    return post

@api_router.post("/blog/posts", response_model=BlogPost)
async def create_blog_post(input: BlogPostCreate):
    """Créer un nouvel article de blog"""
    # Check if slug already exists
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
async def update_blog_post(post_id: str, input: BlogPostUpdate):
    """Mettre à jour un article de blog"""
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Check slug uniqueness if being updated
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
async def delete_blog_post(post_id: str):
    """Supprimer un article de blog"""
    result = await db.blog_posts.delete_one({"id": post_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    return {"success": True, "message": "Article supprimé"}

@api_router.get("/blog/categories", response_model=List[Category])
async def get_blog_categories():
    """Récupérer toutes les catégories avec le nombre d'articles"""
    pipeline = [
        {"$match": {"published": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    categories = await db.blog_posts.aggregate(pipeline).to_list(100)
    
    return [Category(name=cat["_id"], count=cat["count"]) for cat in categories if cat["_id"]]

@api_router.get("/blog/tags", response_model=List[str])
async def get_blog_tags():
    """Récupérer tous les tags uniques"""
    pipeline = [
        {"$match": {"published": True}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags"}},
        {"$sort": {"_id": 1}}
    ]
    
    tags = await db.blog_posts.aggregate(pipeline).to_list(100)
    
    return [tag["_id"] for tag in tags if tag["_id"]]

@api_router.get("/blog/recent", response_model=List[BlogPost])
async def get_recent_posts(limit: int = Query(5, ge=1, le=10)):
    """Récupérer les articles récents"""
    posts = await db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    
    return posts

# Sitemap endpoint
@api_router.get("/sitemap.xml")
async def get_sitemap():
    """Générer le sitemap XML dynamique"""
    base_url = "https://lauzerte-immo.preview.emergentagent.com"
    
    posts = await db.blog_posts.find({"published": True}, {"slug": 1, "updated_at": 1, "_id": 0}).to_list(1000)
    
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    xml_content += f'  <url>\n    <loc>{base_url}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n'
    
    # Blog listing
    xml_content += f'  <url>\n    <loc>{base_url}/blog</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n'
    
    # Blog posts
    for post in posts:
        lastmod = post.get('updated_at', '')
        if isinstance(lastmod, str) and lastmod:
            lastmod = lastmod[:10]
        else:
            lastmod = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        xml_content += f'  <url>\n    <loc>{base_url}/blog/{post["slug"]}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    
    xml_content += '</urlset>'
    
    return Response(content=xml_content, media_type="application/xml")

# Seed sample blog posts
@api_router.post("/blog/seed")
async def seed_blog_posts():
    """Créer des articles de blog de démonstration"""
    existing = await db.blog_posts.count_documents({})
    if existing > 0:
        return {"message": f"{existing} articles existent déjà", "seeded": False}
    
    sample_posts = [
        {
            "id": str(uuid.uuid4()),
            "title": "Comment bien préparer la vente de votre maison à Lauzerte",
            "slug": "preparer-vente-maison-lauzerte",
            "excerpt": "Découvrez les étapes essentielles pour maximiser la valeur de votre bien immobilier avant sa mise en vente dans le secteur de Lauzerte.",
            "content": """<h2>Introduction</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>

<h2>1. Évaluer correctement votre bien</h2>
<p>Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>

<h2>2. Préparer votre maison pour les visites</h2>
<p>Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

<h2>3. Les documents à rassembler</h2>
<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>

<h2>Conclusion</h2>
<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Contactez-moi pour une estimation gratuite de votre bien.</p>""",
            "category": "Conseils Vente",
            "tags": ["vente", "lauzerte", "préparation", "estimation"],
            "image_url": "https://images.unsplash.com/photo-1726553756140-c5257a32a6ae?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
            "meta_title": "Préparer la vente de votre maison à Lauzerte | BSK Immobilier",
            "meta_description": "Guide complet pour préparer la vente de votre maison à Lauzerte. Conseils d'expert pour maximiser la valeur de votre bien immobilier.",
            "published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Le marché immobilier à Montcuq : tendances et opportunités",
            "slug": "marche-immobilier-montcuq-tendances",
            "excerpt": "Analyse du marché immobilier de Montcuq et ses environs. Prix, tendances et conseils pour investir dans cette région du Lot.",
            "content": """<h2>État du marché en 2025</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>

<h2>Les prix au m² à Montcuq</h2>
<p>Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

<h2>Pourquoi investir à Montcuq ?</h2>
<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

<h2>Les quartiers à privilégier</h2>
<p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.</p>

<h2>Conclusion</h2>
<p>Ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>""",
            "category": "Marché Immobilier",
            "tags": ["montcuq", "investissement", "prix", "tendances"],
            "image_url": "https://images.pexels.com/photos/8293717/pexels-photo-8293717.jpeg?auto=compress&cs=tinysrgb&w=800",
            "meta_title": "Marché immobilier Montcuq 2025 | Tendances et prix | BSK Immobilier",
            "meta_description": "Découvrez les tendances du marché immobilier à Montcuq. Prix au m², opportunités d'investissement et conseils d'expert.",
            "published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "5 astuces déco pour valoriser votre bien avant la vente",
            "slug": "astuces-deco-valoriser-bien-vente",
            "excerpt": "Des conseils simples et efficaces pour mettre en valeur votre intérieur et séduire les acheteurs potentiels.",
            "content": """<h2>L'importance du home staging</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>

<h2>1. Désencombrer les espaces</h2>
<p>Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>

<h2>2. Jouer avec la lumière</h2>
<p>Eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<h2>3. Neutraliser les couleurs</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

<h2>4. Soigner l'entrée</h2>
<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

<h2>5. Mettre en scène les pièces</h2>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>""",
            "category": "Conseils Déco",
            "tags": ["déco", "home staging", "valorisation", "vente"],
            "image_url": "https://images.unsplash.com/photo-1752119491943-69bbabe34436?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
            "meta_title": "5 astuces déco pour vendre votre maison | BSK Immobilier",
            "meta_description": "Conseils home staging pour valoriser votre bien immobilier. 5 astuces simples pour séduire les acheteurs.",
            "published": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.blog_posts.insert_many(sample_posts)
    
    return {"message": "3 articles de démonstration créés", "seeded": True}

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
