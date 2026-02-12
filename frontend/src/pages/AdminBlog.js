import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  'Conseils Vente',
  'Conseils Achat',
  'Marché Immobilier',
  'Conseils Déco',
  'Actualités'
];

const createSlug = (title) => {
  let slug = title.toLowerCase();
  slug = slug.replace(/[àáâãäå]/g, 'a');
  slug = slug.replace(/[èéêë]/g, 'e');
  slug = slug.replace(/[ìíîï]/g, 'i');
  slug = slug.replace(/[òóôõö]/g, 'o');
  slug = slug.replace(/[ùúûü]/g, 'u');
  slug = slug.replace(/[ç]/g, 'c');
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/[\s_]+/g, '-');
  slug = slug.replace(/-+/g, '-');
  return slug.trim().replace(/^-|-$/g, '');
};

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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
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
        await axios.put(`${API}/blog/posts/${post.id}`, payload);
        toast.success('Article mis à jour');
      } else {
        await axios.post(`${API}/blog/posts`, payload);
        toast.success('Article créé');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Titre de l'article"
            className="mt-1"
            data-testid="admin-input-title"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="url-de-larticle"
            className="mt-1"
            data-testid="admin-input-slug"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger className="mt-1" data-testid="admin-select-category">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="vente, lauzerte, conseils"
            className="mt-1"
            data-testid="admin-input-tags"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Extrait *</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleChange('excerpt', e.target.value)}
          placeholder="Résumé court de l'article (affiché dans la liste)"
          rows={3}
          className="mt-1"
          data-testid="admin-input-excerpt"
        />
      </div>

      <div>
        <Label htmlFor="content">Contenu (HTML) *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="<h2>Titre</h2><p>Contenu de l'article...</p>"
          rows={12}
          className="mt-1 font-mono text-sm"
          data-testid="admin-input-content"
        />
      </div>

      <div>
        <Label htmlFor="image_url">URL de l'image</Label>
        <Input
          id="image_url"
          value={formData.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
          placeholder="https://..."
          className="mt-1"
          data-testid="admin-input-image"
        />
        {formData.image_url && (
          <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="meta_title">Meta Title (SEO)</Label>
          <Input
            id="meta_title"
            value={formData.meta_title}
            onChange={(e) => handleChange('meta_title', e.target.value)}
            placeholder="Titre pour les moteurs de recherche"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="meta_description">Meta Description (SEO)</Label>
          <Input
            id="meta_description"
            value={formData.meta_description}
            onChange={(e) => handleChange('meta_description', e.target.value)}
            placeholder="Description pour les moteurs de recherche"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="published"
          checked={formData.published}
          onCheckedChange={(checked) => handleChange('published', checked)}
          data-testid="admin-switch-published"
        />
        <Label htmlFor="published">Article publié</Label>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-[#0079e8] hover:bg-[#0062bd]"
          data-testid="admin-btn-save"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Enregistrement...' : (post ? 'Mettre à jour' : 'Créer')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
      </div>
    </form>
  );
};

export const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/blog/posts`, {
        params: { published_only: false, per_page: 100 }
      });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API}/blog/posts/${postId}`);
      toast.success('Article supprimé');
      fetchPosts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSave = () => {
    setShowEditor(false);
    setEditingPost(null);
    fetchPosts();
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditingPost(null);
    setShowEditor(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-blog-page">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-500 hover:text-[#0079e8]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-heading text-xl font-semibold text-slate-800">
              Administration Blog
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to="/blog" target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Voir le blog
              </Button>
            </Link>
            <Button 
              onClick={handleNew}
              className="bg-[#0079e8] hover:bg-[#0062bd]"
              size="sm"
              data-testid="admin-btn-new"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel article
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showEditor ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PostEditor
                post={editingPost}
                onSave={handleSave}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingPost(null);
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Articles ({posts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">Aucun article</p>
                  <Button onClick={handleNew} className="bg-[#0079e8] hover:bg-[#0062bd]">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le premier article
                  </Button>
                </div>
              ) : (
                <div className="divide-y" data-testid="admin-posts-list">
                  {posts.map((post) => (
                    <div key={post.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-800 truncate">
                            {post.title}
                          </h3>
                          {!post.published && (
                            <Badge variant="secondary" className="text-xs">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Brouillon
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
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(post)}
                          data-testid={`admin-edit-${post.slug}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Dialog open={deleteConfirm === post.id} onOpenChange={(open) => setDeleteConfirm(open ? post.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Supprimer l'article ?</DialogTitle>
                            </DialogHeader>
                            <p className="text-slate-600">
                              Êtes-vous sûr de vouloir supprimer "{post.title}" ? Cette action est irréversible.
                            </p>
                            <div className="flex justify-end gap-3 mt-4">
                              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                                Annuler
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleDelete(post.id)}
                                data-testid={`admin-delete-confirm-${post.slug}`}
                              >
                                Supprimer
                              </Button>
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
        )}
      </main>
    </div>
  );
};

export default AdminBlog;
