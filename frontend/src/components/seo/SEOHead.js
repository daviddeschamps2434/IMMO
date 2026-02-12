import { Helmet } from 'react-helmet-async';

export const SEOHead = ({ 
  title = '', 
  description = '', 
  image = '', 
  url = '', 
  type = 'website',
  article = null,
  breadcrumbs = null 
}) => {
  const siteUrl = process.env.REACT_APP_BACKEND_URL || 'https://lauzerte-immo.preview.emergentagent.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullTitle = title ? `${title} | BSK Immobilier - Clotilde Martin` : 'BSK Immobilier - Clotilde Martin';
  const metaDescription = description || 'Agent immobilier BSK sur Lauzerte, Montcuq et Montaigu-de-Quercy. Accompagnement personnalisé pour vendre ou acheter votre bien.';
  
  // Schema.org for Article
  const articleSchema = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.image_url,
    "datePublished": article.created_at,
    "dateModified": article.updated_at,
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
      "name": "BSK Immobilier",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    }
  } : null;

  // Schema.org for BreadcrumbList
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${siteUrl}${crumb.url}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content="BSK Immobilier - Clotilde Martin" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Schema.org JSON-LD */}
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
