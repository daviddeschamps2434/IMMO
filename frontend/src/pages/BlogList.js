import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import Breadcrumb from '@/components/blog/Breadcrumb';
import SEOHead from '@/components/seo/SEOHead';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentCategory = searchParams.get('category') || null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, categoriesRes, recentRes] = await Promise.all([
          axios.get(`${API}/blog/posts`, {
            params: {
              page: currentPage,
              per_page: 6,
              category: currentCategory
            }
          }),
          axios.get(`${API}/blog/categories`),
          axios.get(`${API}/blog/recent`, { params: { limit: 5 } })
        ]);
        
        setPosts(postsRes.data.posts);
        setTotalPages(postsRes.data.total_pages);
        setCategories(categoriesRes.data);
        setRecentPosts(recentRes.data);
      } catch (error) {
        console.error('Error fetching blog data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, currentCategory]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (category) => {
    const params = new URLSearchParams();
    if (category) {
      params.set('category', category);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const breadcrumbItems = currentCategory
    ? [{ name: 'Blog', url: '/blog' }, { name: currentCategory }]
    : [{ name: 'Blog' }];

  return (
    <>
      <SEOHead
        title={currentCategory ? `${currentCategory} - Blog` : 'Blog Immobilier'}
        description="Conseils et actualités immobilières sur Lauzerte, Montcuq et Montaigu-de-Quercy. Guides pratiques pour vendre ou acheter votre bien."
        url="/blog"
        type="website"
      />
      
      <div className="min-h-screen bg-white" data-testid="blog-list-page">
        {/* Hero Section */}
        <section className="bg-slate-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              {currentCategory || 'Blog Immobilier'}
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl">
              Conseils, actualités et guides pratiques pour réussir votre projet immobilier dans le Tarn-et-Garonne et le Lot.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge
                variant={!currentCategory ? "default" : "secondary"}
                className={`cursor-pointer transition-colors ${
                  !currentCategory
                    ? 'bg-[#0079e8] text-white'
                    : 'hover:bg-[#0079e8] hover:text-white'
                }`}
                onClick={() => handleCategoryClick(null)}
                data-testid="filter-all"
              >
                Tous les articles
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.name}
                  variant={currentCategory === cat.name ? "default" : "secondary"}
                  className={`cursor-pointer transition-colors ${
                    currentCategory === cat.name
                      ? 'bg-[#0079e8] text-white'
                      : 'hover:bg-[#0079e8] hover:text-white'
                  }`}
                  onClick={() => handleCategoryClick(cat.name)}
                  data-testid={`filter-${cat.name}`}
                >
                  {cat.name} ({cat.count})
                </Badge>
              ))}
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Posts Grid */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-slate-100 rounded-xl h-80 animate-pulse" />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-lg">Aucun article trouvé</p>
                    {currentCategory && (
                      <Button
                        variant="outline"
                        onClick={() => handleCategoryClick(null)}
                        className="mt-4"
                      >
                        Voir tous les articles
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6" data-testid="blog-posts-grid">
                      {posts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-12" data-testid="pagination">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            className={page === currentPage ? "bg-[#0079e8]" : ""}
                            onClick={() => handlePageChange(page)}
                            data-testid={`page-${page}`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <BlogSidebar
                  categories={categories}
                  recentPosts={recentPosts}
                  currentCategory={currentCategory}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogList;
