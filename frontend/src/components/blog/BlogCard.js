import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';

export const BlogCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col"
      data-testid={`blog-card-${post.slug}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-[#0079e8] hover:bg-[#0062bd] text-white">
            {post.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(post.created_at)}</span>
        </div>
        <h3 className="font-heading text-xl font-semibold text-slate-800 mb-3 line-clamp-2 group-hover:text-[#0079e8] transition-colors">
          {post.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>
        <Link 
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-[#0079e8] font-medium hover:gap-3 transition-all"
          data-testid={`blog-read-more-${post.slug}`}
        >
          Lire la suite
          <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
