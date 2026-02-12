import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, User, Tag, FolderOpen } from 'lucide-react';

const AGENT = {
  name: "Clotilde Martin",
  role: "Mandataire BSK Immobilier",
  phone: "06 20 83 38 87",
  phoneLink: "tel:0620833887",
  location: "Bardigues (82340)",
  photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
};

export const BlogSidebar = ({ categories = [], recentPosts = [], currentCategory = null }) => {
  return (
    <aside className="space-y-6" data-testid="blog-sidebar">
      {/* Agent Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-[#0079e8] p-6 text-white text-center">
          <img
            src={AGENT.photo}
            alt={AGENT.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 object-cover"
          />
          <h3 className="font-heading text-xl font-semibold">{AGENT.name}</h3>
          <p className="text-white/80 text-sm">{AGENT.role}</p>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-[#0079e8]" />
              <span className="text-sm">{AGENT.location}</span>
            </div>
            <a
              href={AGENT.phoneLink}
              className="flex items-center justify-center gap-2 bg-[#0079e8] text-white py-2 px-4 rounded-full font-medium hover:bg-[#0062bd] transition-colors w-full"
              data-testid="sidebar-phone-btn"
            >
              <Phone className="w-4 h-4" />
              {AGENT.phone}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="w-5 h-5 text-[#0079e8]" />
              Catégories
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/blog?category=${encodeURIComponent(cat.name)}`}
                  data-testid={`sidebar-category-${cat.name}`}
                >
                  <Badge
                    variant={currentCategory === cat.name ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors ${
                      currentCategory === cat.name
                        ? 'bg-[#0079e8] text-white'
                        : 'hover:bg-[#0079e8] hover:text-white'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="w-5 h-5 text-[#0079e8]" />
              Articles récents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-slate-700 hover:text-[#0079e8] transition-colors text-sm line-clamp-2"
                    data-testid={`sidebar-recent-${post.slug}`}
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* CTA Card */}
      <Card className="border-0 shadow-md bg-slate-50">
        <CardContent className="p-6 text-center">
          <User className="w-10 h-10 text-[#0079e8] mx-auto mb-3" />
          <h4 className="font-semibold text-slate-800 mb-2">Besoin d'un conseil ?</h4>
          <p className="text-slate-600 text-sm mb-4">
            Je vous accompagne dans votre projet immobilier
          </p>
          <Link
            to="/#lead-form-section"
            className="inline-block bg-[#0079e8] text-white py-2 px-6 rounded-full font-medium hover:bg-[#0062bd] transition-colors"
            data-testid="sidebar-cta-btn"
          >
            Estimation gratuite
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
};

export default BlogSidebar;
