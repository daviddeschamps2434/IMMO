import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Save, X, 
  LogOut, Home, FileText, Settings, Users, Layout, Globe,
  Phone, MapPin, Image, Type, AlignLeft, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = ['Conseils Vente', 'Conseils Achat', 'Marché Immobilier', 'Conseils Déco', 'Actualités'];

// Auth context
const getToken = () => localStorage.getItem('admin_token');
const setToken = (token) => localStorage.setItem('admin_token', token);
const clearToken = () => localStorage.removeItem('admin_token');

const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// Login Component
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password });
      if (response.data.success) {
        setToken(response.data.token);
        onLogin();
        toast.success('Connexion réussie');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#0079e8] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Administration</CardTitle>
          <CardDescription>BSK Immobilier - Clotilde Martin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Identifiant</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="mt-1"
                data-testid="login-username"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                data-testid="login-password"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0079e8] hover:bg-[#0062bd]"
              data-testid="login-submit"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Site Content Editor
const SiteContentEditor = () => {
  const [content, setContent] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [contentRes, sectorsRes] = await Promise.all([
        axios.get(`${API}/site/content`),
        axios.get(`${API}/site/sectors`)
      ]);
      setContent(contentRes.data);
      setSectors(sectorsRes.data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSectorChange = (index, field, value) => {
    const newSectors = [...sectors];
    newSectors[index] = { ...newSectors[index], [field]: value };
    setSectors(newSectors);
  };

  const addSector = () => {
    setSectors([...sectors, { 
      id: Date.now().toString(), 
      name: '', 
      code: '', 
      description: '', 
      image_url: '' 
    }]);
  };

  const removeSector = (index) => {
    setSectors(sectors.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        axios.put(`${API}/site/content`, content, authHeaders()),
        axios.put(`${API}/site/sectors`, { sectors }, authHeaders())
      ]);
      toast.success('Modifications enregistrées');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Contenu du site</h2>
        <Button onClick={saveAll} disabled={saving} className="bg-[#0079e8] hover:bg-[#0062bd]">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Enregistrement...' : 'Enregistrer tout'}
        </Button>
      </div>

      <Tabs defaultValue="seo" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="seo"><Globe className="w-4 h-4 mr-2" />SEO</TabsTrigger>
          <TabsTrigger value="hero"><Layout className="w-4 h-4 mr-2" />Hero</TabsTrigger>
          <TabsTrigger value="agent"><Users className="w-4 h-4 mr-2" />Agent</TabsTrigger>
          <TabsTrigger value="sectors"><MapPin className="w-4 h-4 mr-2" />Secteurs</TabsTrigger>
          <TabsTrigger value="footer"><Layers className="w-4 h-4 mr-2" />Footer</TabsTrigger>
        </TabsList>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Référencement SEO</CardTitle>
              <CardDescription>Balises meta pour les moteurs de recherche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title (balise title)</Label>
                <Input
                  value={content?.meta_title || ''}
                  onChange={(e) => handleContentChange('meta_title', e.target.value)}
                  className="mt-1"
                  data-testid="seo-meta-title"
                />
                <p className="text-sm text-slate-500 mt-1">{content?.meta_title?.length || 0}/60 caractères recommandés</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={content?.meta_description || ''}
                  onChange={(e) => handleContentChange('meta_description', e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-testid="seo-meta-description"
                />
                <p className="text-sm text-slate-500 mt-1">{content?.meta_description?.length || 0}/160 caractères recommandés</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Section Hero</CardTitle>
              <CardDescription>Bannière principale de la page d'accueil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre principal</Label>
                <Input
                  value={content?.hero_title || ''}
                  onChange={(e) => handleContentChange('hero_title', e.target.value)}
                  className="mt-1"
                  data-testid="hero-title"
                />
              </div>
              <div>
                <Label>Sous-titre</Label>
                <Textarea
                  value={content?.hero_subtitle || ''}
                  onChange={(e) => handleContentChange('hero_subtitle', e.target.value)}
                  rows={2}
                  className="mt-1"
                  data-testid="hero-subtitle"
                />
              </div>
              <div>
                <Label>Texte du bouton CTA</Label>
                <Input
                  value={content?.hero_cta_text || ''}
                  onChange={(e) => handleContentChange('hero_cta_text', e.target.value)}
                  className="mt-1"
                  data-testid="hero-cta"
                />
              </div>
              <div>
                <Label>URL de l'image de fond</Label>
                <Input
                  value={content?.hero_image_url || ''}
                  onChange={(e) => handleContentChange('hero_image_url', e.target.value)}
                  className="mt-1"
                  data-testid="hero-image"
                />
                {content?.hero_image_url && (
                  <img src={content.hero_image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Tab */}
        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle>Informations Agent</CardTitle>
              <CardDescription>Présentation de l'agent immobilier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre de la section</Label>
                <Input
                  value={content?.agent_section_title || ''}
                  onChange={(e) => handleContentChange('agent_section_title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={content?.agent_name || ''}
                    onChange={(e) => handleContentChange('agent_name', e.target.value)}
                    className="mt-1"
                    data-testid="agent-name"
                  />
                </div>
                <div>
                  <Label>Rôle / Fonction</Label>
                  <Input
                    value={content?.agent_role || ''}
                    onChange={(e) => handleContentChange('agent_role', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={content?.agent_phone || ''}
                    onChange={(e) => handleContentChange('agent_phone', e.target.value)}
                    className="mt-1"
                    data-testid="agent-phone"
                  />
                </div>
                <div>
                  <Label>Localisation</Label>
                  <Input
                    value={content?.agent_location || ''}
                    onChange={(e) => handleContentChange('agent_location', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Citation / Accroche</Label>
                <Textarea
                  value={content?.agent_quote || ''}
                  onChange={(e) => handleContentChange('agent_quote', e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-testid="agent-quote"
                />
              </div>
              <div>
                <Label>URL de la photo</Label>
                <Input
                  value={content?.agent_photo_url || ''}
                  onChange={(e) => handleContentChange('agent_photo_url', e.target.value)}
                  className="mt-1"
                />
                {content?.agent_photo_url && (
                  <img src={content.agent_photo_url} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full" />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sectors Tab */}
        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle>Secteurs d'intervention</CardTitle>
              <CardDescription>Zones géographiques couvertes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Titre de la section</Label>
                  <Input
                    value={content?.sectors_section_title || ''}
                    onChange={(e) => handleContentChange('sectors_section_title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Sous-titre</Label>
                  <Input
                    value={content?.sectors_section_subtitle || ''}
                    onChange={(e) => handleContentChange('sectors_section_subtitle', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                {sectors.map((sector, index) => (
                  <Card key={sector.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Secteur {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeSector(index)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom</Label>
                        <Input
                          value={sector.name}
                          onChange={(e) => handleSectorChange(index, 'name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Code postal</Label>
                        <Input
                          value={sector.code}
                          onChange={(e) => handleSectorChange(index, 'code', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Description</Label>
                      <Input
                        value={sector.description}
                        onChange={(e) => handleSectorChange(index, 'description', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="mt-4">
                      <Label>URL de l'image</Label>
                      <Input
                        value={sector.image_url}
                        onChange={(e) => handleSectorChange(index, 'image_url', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </Card>
                ))}
                <Button variant="outline" onClick={addSector} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un secteur
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Pied de page</CardTitle>
              <CardDescription>Informations du footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre formulaire</Label>
                <Input
                  value={content?.form_title || ''}
                  onChange={(e) => handleContentChange('form_title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Sous-titre formulaire</Label>
                <Input
                  value={content?.form_subtitle || ''}
                  onChange={(e) => handleContentChange('form_subtitle', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Texte bouton formulaire</Label>
                <Input
                  value={content?.form_button_text || ''}
                  onChange={(e) => handleContentChange('form_button_text', e.target.value)}
                  className="mt-1"
                />
              </div>
              <Separator />
              <div>
                <Label>Slogan footer</Label>
                <Input
                  value={content?.footer_tagline || ''}
                  onChange={(e) => handleContentChange('footer_tagline', e.target.value)}
                  className="mt-1"
                  data-testid="footer-tagline"
                />
              </div>
              <div>
                <Label>RSAC</Label>
                <Input
                  value={content?.footer_rsac || ''}
                  onChange={(e) => handleContentChange('footer_rsac', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Copyright</Label>
                <Input
                  value={content?.footer_copyright || ''}
                  onChange={(e) => handleContentChange('footer_copyright', e.target.value)}
                  className="mt-1"
                  data-testid="footer-copyright"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Blog Posts Manager
const BlogPostsManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/blog/posts`, { params: { published_only: false, per_page: 100 } });
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API}/blog/posts/${postId}`, authHeaders());
      toast.success('Article supprimé');
      fetchPosts();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingPost(null);
    fetchPosts();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (showEditor) {
    return <PostEditor post={editingPost} onSave={handleSave} onCancel={() => { setShowEditor(false); setEditingPost(null); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Articles de blog</h2>
        <Button onClick={() => setShowEditor(true)} className="bg-[#0079e8] hover:bg-[#0062bd]">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Chargement...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 mb-4">Aucun article</p>
              <Button onClick={() => setShowEditor(true)} className="bg-[#0079e8]">
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier article
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {posts.map((post) => (
                <div key={post.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-800 truncate">{post.title}</h3>
                      {!post.published && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="w-3 h-3 mr-1" />Brouillon
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Badge variant="outline">{post.category}</Badge>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/blog/${post.slug}`} target="_blank">
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingPost(post); setShowEditor(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Dialog open={deleteConfirm === post.id} onOpenChange={(open) => setDeleteConfirm(open ? post.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Supprimer l'article ?</DialogTitle></DialogHeader>
                        <p className="text-slate-600">Cette action est irréversible.</p>
                        <div className="flex justify-end gap-3 mt-4">
                          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                          <Button variant="destructive" onClick={() => handleDelete(post.id)}>Supprimer</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Post Editor Component
const PostEditor = ({ post = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || '',
    tags: post?.tags?.join(', ') || '',
    image_url: post?.image_url || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    published: post?.published ?? true
  });
  const [saving, setSaving] = useState(false);

  const createSlug = (title) => {
    return title.toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim().replace(/^-|-$/g, '');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && !post) {
      setFormData(prev => ({ ...prev, slug: createSlug(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt.substring(0, 160)
      };
      
      if (post) {
        await axios.put(`${API}/blog/posts/${post.id}`, payload, authHeaders());
        toast.success('Article mis à jour');
      } else {
        await axios.post(`${API}/blog/posts`, payload, authHeaders());
        toast.success('Article créé');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}><ArrowLeft className="w-4 h-4" /></Button>
          <CardTitle>{post ? 'Modifier l\'article' : 'Nouvel article'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Titre *</Label>
              <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Slug (URL) *</Label>
              <Input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (virgules)</Label>
              <Input value={formData.tags} onChange={(e) => handleChange('tags', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Extrait *</Label>
            <Textarea value={formData.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} rows={2} className="mt-1" />
          </div>
          <div>
            <Label>Contenu (HTML) *</Label>
            <Textarea value={formData.content} onChange={(e) => handleChange('content', e.target.value)} rows={10} className="mt-1 font-mono text-sm" />
          </div>
          <div>
            <Label>URL image</Label>
            <Input value={formData.image_url} onChange={(e) => handleChange('image_url', e.target.value)} className="mt-1" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Meta Title (SEO)</Label>
              <Input value={formData.meta_title} onChange={(e) => handleChange('meta_title', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Meta Description (SEO)</Label>
              <Input value={formData.meta_description} onChange={(e) => handleChange('meta_description', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={formData.published} onCheckedChange={(checked) => handleChange('published', checked)} />
            <Label>Article publié</Label>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={saving} className="bg-[#0079e8] hover:bg-[#0062bd]">
              <Save className="w-4 h-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Leads Manager
const LeadsManager = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/leads`, authHeaders());
      setLeads(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId) => {
    try {
      await axios.delete(`${API}/leads/${leadId}`, authHeaders());
      toast.success('Lead supprimé');
      fetchLeads();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Demandes de contact ({leads.length})</h2>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Chargement...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Aucune demande</div>
          ) : (
            <div className="divide-y">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-slate-800">{lead.nom}</h3>
                      <p className="text-sm text-slate-600">{lead.email} • {lead.telephone}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge>{lead.ville}</Badge>
                        <Badge variant="outline">{lead.type_bien}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{formatDate(lead.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(lead.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main Admin Component
export const AdminBlog = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setChecking(false);
      return;
    }
    try {
      await axios.get(`${API}/auth/verify`, authHeaders());
      setIsAuthenticated(true);
    } catch {
      clearToken();
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100" data-testid="admin-page">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0079e8] rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">Administration</h1>
              <p className="text-xs text-slate-500">BSK Immobilier</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />Voir le site</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'content' ? 'border-[#0079e8] text-[#0079e8]' : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />Page d'accueil
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'blog' ? 'border-[#0079e8] text-[#0079e8]' : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />Blog
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'leads' ? 'border-[#0079e8] text-[#0079e8]' : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />Contacts
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'content' && <SiteContentEditor />}
        {activeTab === 'blog' && <BlogPostsManager />}
        {activeTab === 'leads' && <LeadsManager />}
      </main>
    </div>
  );
};

export default AdminBlog;
