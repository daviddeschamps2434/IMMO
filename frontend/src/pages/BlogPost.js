import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Tag, ArrowLeft, Share2, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BlogSidebar from '@/components/blog/BlogSidebar';
import Breadcrumb from '@/components/blog/Breadcrumb';
import SEOHead from '@/components/seo/SEOHead';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postRes, categoriesRes, recentRes] = await Promise.all([
          axios.get(`${API}/blog/posts/${slug}`),
          axios.get(`${API}/blog/categories`),
          axios.get(`${API}/blog/recent`, { params: { limit: 5 } })
        ]);
        
        setPost(postRes.data);
        setCategories(categoriesRes.data);
        setRecentPosts(recentRes.data.filter(p => p.slug !== slug));
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Article non trouvé');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Article non trouvé</h1>
          <Link to="/blog">
            <Button className="bg-[#0079e8] hover:bg-[#0062bd]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'Blog', url: '/blog' },
    { name: post.category, url: `/blog?category=${encodeURIComponent(post.category)}` },
    { name: post.title }
  ];

  const breadcrumbsForSEO = [
    { name: 'Accueil', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` }
  ];

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        image={post.image_url}
        url={`/blog/${post.slug}`}
        type="article"
        article={post}
        breadcrumbs={breadcrumbsForSEO}
      />
      
      <div className="min-h-screen bg-white" data-testid="blog-post-page">
        {/* Hero Image */}
        {post.image_url && (
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <article className="lg:col-span-3">
                <Breadcrumb items={breadcrumbItems} />
                
                {/* Header */}
                <header className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-[#0079e8] text-white">
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  <h1 
                    className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4"
                    data-testid="post-title"
                  >
                    {post.title}
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                </header>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#0079e8] transition-colors"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Article Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-[#0079e8] prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  data-testid="post-content"
                />

                {/* Share & Actions */}
                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                  <Link to="/blog">
                    <Button variant="outline" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Retour au blog
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                    className="gap-2"
                    data-testid="share-btn"
                  >
                    <Share2 className="w-4 h-4" />
                    Partager
                  </Button>
                </div>

                {/* CTA Box */}
                <div className="mt-12 bg-[#0079e8] rounded-2xl p-8 text-white text-center">
                  <h3 className="font-heading text-2xl font-semibold mb-3">
                    Vous avez un projet immobilier ?
                  </h3>
                  <p className="text-white/90 mb-6">
                    Je vous accompagne dans la vente de votre bien sur Lauzerte, Montcuq et Montaigu-de-Quercy.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href="tel:0620833887"
                      className="inline-flex items-center gap-2 bg-white text-[#0079e8] px-6 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      06 20 83 38 87
                    </a>
                    <Link
                      to="/#lead-form-section"
                      className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors"
                    >
                      Estimation gratuite
                    </Link>
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <BlogSidebar
                  categories={categories}
                  recentPosts={recentPosts}
                  currentCategory={post.category}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPost;
