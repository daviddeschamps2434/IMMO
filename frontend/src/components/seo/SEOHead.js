import { Helmet } from 'react-helmet-async';

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
  
  // Ensure title is always a valid string
  const pageTitle = title 
    ? String(title) + ' | BSK Immobilier - Clotilde Martin'
    : 'BSK Immobilier - Clotilde Martin';
  
  const metaDescription = description 
    ? String(description)
    : 'Agent immobilier BSK sur Lauzerte, Montcuq et Montaigu-de-Quercy. Accompagnement personnalisé pour vendre ou acheter votre bien.';
  
  // Schema.org for Article
  const articleSchema = article ? {
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
      "jobTitle": "Agent Immobilier",
      "worksFor": {
        "@type": "Organization",
        "name": "BSK Immobilier"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "BSK Immobilier"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    }
  } : null;

  // Schema.org for BreadcrumbList
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name || '',
      "item": crumb.url ? `${siteUrl}${crumb.url}` : siteUrl
    }))
  } : null;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content="BSK Immobilier - Clotilde Martin" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
      
      <link rel="canonical" href={fullUrl} />
      
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
