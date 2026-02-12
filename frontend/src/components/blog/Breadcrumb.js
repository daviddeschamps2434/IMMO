import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items }) => {
  return (
    <nav 
      aria-label="Fil d'Ariane" 
      className="flex items-center gap-2 text-sm text-slate-500 mb-6"
      data-testid="breadcrumb"
    >
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-[#0079e8] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Accueil</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {item.url ? (
            <Link 
              to={item.url}
              className="hover:text-[#0079e8] transition-colors"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-slate-700 font-medium">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
