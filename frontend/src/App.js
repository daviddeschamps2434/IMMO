import { useState, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import axios from "axios";
import { Phone, Mail, MapPin, Home, Building, LandPlot, Warehouse, CheckCircle, User, Menu, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import SEOHead from "@/components/seo/SEOHead";

// Pages
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import AdminBlog from "@/pages/AdminBlog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Agent info
const AGENT = {
  name: "Clotilde Martin",
  role: "Mandataire BSK Immobilier",
  phone: "06 20 83 38 87",
  phoneLink: "tel:0620833887",
  location: "Bardigues (82340)",
  quote: "VENDRE ou ACHETER un bien immobilier est un acte important et l'accompagnement d'un professionnel est nécessaire pour réussir votre projet sereinement et en toute sécurité.",
  photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
};

// Sectors
const SECTORS = [
  {
    name: "Lauzerte",
    code: "82110",
    description: "Cité médiévale du Tarn-et-Garonne",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop"
  },
  {
    name: "Montcuq",
    code: "46800",
    description: "Charmant village du Lot",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"
  },
  {
    name: "Montaigu-de-Quercy",
    code: "82150",
    description: "Au cœur du Quercy Blanc",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop"
  }
];

// Property types
const PROPERTY_TYPES = [
  { value: "Maison", label: "Maison", icon: Home },
  { value: "Appartement", label: "Appartement", icon: Building },
  { value: "Terrain", label: "Terrain", icon: LandPlot },
  { value: "Autre bâtiment", label: "Autre bâtiment", icon: Warehouse }
];

// Header Component with Navigation
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header-sticky py-3 px-4 md:px-8" data-testid="header">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0079e8] rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#0079e8] text-lg">BSK</span>
            <span className="font-medium text-slate-700 text-lg"> Immobilier</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/"
            className={`font-medium transition-colors ${isActive('/') && location.pathname === '/' ? 'text-[#0079e8]' : 'text-slate-600 hover:text-[#0079e8]'}`}
            data-testid="nav-home"
          >
            Accueil
          </Link>
          <Link 
            to="/blog"
            className={`font-medium transition-colors ${isActive('/blog') ? 'text-[#0079e8]' : 'text-slate-600 hover:text-[#0079e8]'}`}
            data-testid="nav-blog"
          >
            Blog
          </Link>
          <a 
            href={AGENT.phoneLink}
            className="flex items-center gap-2 bg-[#0079e8] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#0062bd] transition-colors btn-animate"
            data-testid="header-phone-btn"
          >
            <Phone className="w-4 h-4" />
            <span>{AGENT.phone}</span>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-btn"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg py-4 px-4">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium py-2 ${isActive('/') && location.pathname === '/' ? 'text-[#0079e8]' : 'text-slate-600'}`}
            >
              Accueil
            </Link>
            <Link 
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`font-medium py-2 ${isActive('/blog') ? 'text-[#0079e8]' : 'text-slate-600'}`}
            >
              Blog
            </Link>
            <a 
              href={AGENT.phoneLink}
              className="flex items-center justify-center gap-2 bg-[#0079e8] text-white px-4 py-3 rounded-full font-semibold"
            >
              <Phone className="w-4 h-4" />
              <span>{AGENT.phone}</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

// Hero Component
const Hero = ({ onScrollToForm }) => (
  <section 
    className="hero-section"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')`
    }}
    data-testid="hero-section"
  >
    <div className="absolute inset-0 hero-overlay"></div>
    <div className="hero-content px-4 max-w-4xl mx-auto">
      <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
        Confiez votre projet immobilier à une experte locale
      </h1>
      <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
        Accompagnement personnalisé pour la vente de votre bien sur Lauzerte, Montcuq et Montaigu-de-Quercy
      </p>
      <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-200">
        <Button 
          onClick={onScrollToForm}
          className="bg-[#0079e8] hover:bg-[#0062bd] text-white text-lg px-8 py-6 rounded-full font-semibold btn-animate"
          data-testid="hero-cta-btn"
        >
          Estimation gratuite
        </Button>
        <Link to="/blog">
          <Button 
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-lg px-8 py-6 rounded-full font-semibold"
            data-testid="hero-blog-btn"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Nos conseils
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

// Agent Section
const AgentSection = () => (
  <section className="py-16 md:py-24 px-4 bg-slate-50" data-testid="agent-section">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-800 mb-6">
            Votre interlocutrice dédiée
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-semibold text-[#0079e8]">{AGENT.name}</span>
          </div>
          <p className="text-slate-600 mb-2">{AGENT.role}</p>
          <div className="flex items-center gap-2 text-slate-600 mb-6">
            <MapPin className="w-4 h-4 text-[#0079e8]" />
            <span>{AGENT.location}</span>
          </div>
          <blockquote className="font-heading italic text-slate-700 text-lg border-l-4 border-[#0079e8] pl-4 mb-8">
            "{AGENT.quote}"
          </blockquote>
          <div className="flex flex-wrap gap-4">
            <a 
              href={AGENT.phoneLink}
              className="flex items-center gap-2 bg-[#0079e8] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0062bd] transition-colors btn-animate"
              data-testid="agent-phone-btn"
            >
              <Phone className="w-5 h-5" />
              {AGENT.phone}
            </a>
          </div>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative">
            <img 
              src={AGENT.photo}
              alt={AGENT.name}
              className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover agent-photo"
            />
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
              <CheckCircle className="w-8 h-8 text-[#0079e8]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Sectors Section
const SectorsSection = () => (
  <section className="py-16 md:py-24 px-4" data-testid="sectors-section">
    <div className="max-w-6xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-800 text-center mb-4">
        Secteurs d'intervention
      </h2>
      <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
        Expertise locale sur trois secteurs privilégiés du Tarn-et-Garonne et du Lot
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {SECTORS.map((sector, index) => (
          <Card 
            key={sector.name} 
            className="sector-card border-0 shadow-lg overflow-hidden"
            data-testid={`sector-card-${sector.name.toLowerCase()}`}
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={sector.image}
                alt={sector.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-[#0079e8]" />
                <h3 className="font-semibold text-xl text-slate-800">{sector.name}</h3>
              </div>
              <p className="text-slate-600 text-sm mb-1">{sector.code}</p>
              <p className="text-slate-500">{sector.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// Lead Form Component
const LeadForm = ({ formRef }) => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    type_bien: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email || !formData.telephone || !formData.ville || !formData.type_bien) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API}/leads`, formData);
      
      if (response.data.success) {
        setIsSubmitted(true);
        toast.success("Demande envoyée avec succès !");
        setFormData({ nom: "", email: "", telephone: "", ville: "", type_bien: "" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section ref={formRef} className="py-16 md:py-24 px-4 bg-[#0079e8]" data-testid="form-section">
        <div className="max-w-xl mx-auto">
          <div className="lead-form p-8 md:p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h3 className="font-heading text-2xl font-semibold text-slate-800 mb-4">
              Merci pour votre demande !
            </h3>
            <p className="text-slate-600 mb-6">
              Clotilde Martin vous contactera très rapidement pour discuter de votre projet.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="border-[#0079e8] text-[#0079e8] hover:bg-[#0079e8] hover:text-white"
              data-testid="form-new-request-btn"
            >
              Nouvelle demande
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={formRef} className="py-16 md:py-24 px-4 bg-[#0079e8]" data-testid="form-section">
      <div className="max-w-xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-white text-center mb-4">
          Recevez une estimation gratuite
        </h2>
        <p className="text-white/90 text-center mb-8">
          Réponse sous 24h par Clotilde Martin
        </p>
        <form onSubmit={handleSubmit} className="lead-form p-8 md:p-12">
          <div className="space-y-6">
            <div>
              <Label htmlFor="nom" className="text-slate-700 font-medium">Nom complet</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="nom"
                  type="text"
                  placeholder="Votre nom"
                  value={formData.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-[#0079e8] focus:ring-[#0079e8]"
                  data-testid="form-input-nom"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-[#0079e8] focus:ring-[#0079e8]"
                  data-testid="form-input-email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="telephone" className="text-slate-700 font-medium">Téléphone</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="06 XX XX XX XX"
                  value={formData.telephone}
                  onChange={(e) => handleChange("telephone", e.target.value)}
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-[#0079e8] focus:ring-[#0079e8]"
                  data-testid="form-input-telephone"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ville" className="text-slate-700 font-medium">Ville du bien</Label>
              <Select value={formData.ville} onValueChange={(value) => handleChange("ville", value)}>
                <SelectTrigger 
                  className="h-12 bg-slate-50 border-slate-200 focus:border-[#0079e8] focus:ring-[#0079e8] mt-2"
                  data-testid="form-select-ville"
                >
                  <SelectValue placeholder="Sélectionnez une ville" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector.name} value={sector.name}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {sector.name} ({sector.code})
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="Autre">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Autre commune
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-700 font-medium">Type de bien à vendre</Label>
              <Select value={formData.type_bien} onValueChange={(value) => handleChange("type_bien", value)}>
                <SelectTrigger 
                  className="h-12 bg-slate-50 border-slate-200 focus:border-[#0079e8] focus:ring-[#0079e8] mt-2"
                  data-testid="form-select-type-bien"
                >
                  <SelectValue placeholder="Sélectionnez le type de bien" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0079e8] hover:bg-[#0062bd] text-white text-lg py-6 rounded-full font-semibold btn-animate"
              data-testid="form-submit-btn"
            >
              {isSubmitting ? "Envoi en cours..." : "Demander un rappel"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-slate-900 text-white py-12 px-4" data-testid="footer">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#0079e8] rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#0079e8] text-lg">BSK</span>
              <span className="font-medium text-white text-lg"> Immobilier</span>
            </div>
          </Link>
          <p className="text-slate-400">
            Réseau national d'agents mandataires
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-4">Navigation</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link to="/" className="hover:text-[#0079e8] transition-colors">Accueil</Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-[#0079e8] transition-colors">Blog</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-4">Contact</h4>
          <div className="space-y-3">
            <a href={AGENT.phoneLink} className="flex items-center gap-2 text-slate-400 hover:text-[#0079e8] transition-colors">
              <Phone className="w-4 h-4" />
              {AGENT.phone}
            </a>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4" />
              {AGENT.location}
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-4">Secteurs</h4>
          <ul className="space-y-2 text-slate-400">
            {SECTORS.map((sector) => (
              <li key={sector.name}>{sector.name} ({sector.code})</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
        <p>© 2025 BSK Immobilier - Clotilde Martin. Tous droits réservés.</p>
        <p className="mt-2">RSAC : 80951794900024 MONTAUBAN</p>
      </div>
    </div>
  </footer>
);

// Home Page Component
const HomePage = () => {
  const formRef = useRef(null);

  const scrollToForm = () => {
    const formElement = document.getElementById('lead-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEOHead
        title="Agent Immobilier Lauzerte, Montcuq, Montaigu-de-Quercy"
        description="Clotilde Martin, agent immobilier BSK sur Lauzerte, Montcuq et Montaigu-de-Quercy. Accompagnement personnalisé pour vendre ou acheter votre bien immobilier."
        url="/"
      />
      <Hero onScrollToForm={scrollToForm} />
      <AgentSection />
      <SectorsSection />
      <div id="lead-form-section">
        <LeadForm formRef={formRef} />
      </div>
    </>
  );
};

// Layout Component
const Layout = ({ children, showHeaderFooter = true }) => {
  return (
    <div className="App min-h-screen flex flex-col" data-testid="app-container">
      {showHeaderFooter && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

// Main App Component
function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/blog" element={<Layout><BlogList /></Layout>} />
          <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
          <Route path="/admin" element={<AdminBlog />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
