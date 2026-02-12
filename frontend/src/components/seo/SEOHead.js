import { useEffect } from 'react';

export const SEOHead = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  article = null,
  breadcrumbs = null 
}) => {
  const siteUrl = process.env.REACT_APP_BACKEND_URL || 'https://lauzerte-immo.preview.emergentagent.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  
  const pageTitle = title 
    ? `${title} | BSK Immobilier - Clotilde Martin`
    : 'BSK Immobilier - Clotilde Martin';
  
  const metaDescription = description 
    || 'Agent immobilier BSK sur Lauzerte, Montcuq et Montaigu-de-Quercy. Accompagnement personnalisé pour vendre ou acheter votre bien.';

  useEffect(() => {
    // Update document title
    document.title = pageTitle;
    
    // Update or create meta tags
    const updateMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateMeta('description', metaDescription);
    updateMeta('og:title', pageTitle, true);
    updateMeta('og:description', metaDescription, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', fullUrl, true);
    if (image) updateMeta('og:image', image, true);
    updateMeta('og:site_name', 'BSK Immobilier - Clotilde Martin', true);
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', pageTitle);
    updateMeta('twitter:description', metaDescription);
    if (image) updateMeta('twitter:image', image);
    
    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
    
    // Add structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(s => s.remove());
    
    if (article) {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title || '',
        "description": article.excerpt || '',
        "image": article.image_url || '',
        "datePublished": article.created_at || '',
        "dateModified": article.updated_at || '',
        "author": {
          "@type": "Person",
          "name": "Clotilde Martin",
          "jobTitle": "Agent Immobilier"
        },
        "publisher": {
          "@type": "Organization",
          "name": "BSK Immobilier"
        }
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(articleSchema);
      document.head.appendChild(script);
    }
    
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name || '',
          "item": crumb.url ? `${siteUrl}${crumb.url}` : siteUrl
        }))
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(script);
    }
  }, [pageTitle, metaDescription, image, fullUrl, type, article, breadcrumbs, siteUrl]);

  return null;
};

export default SEOHead;
