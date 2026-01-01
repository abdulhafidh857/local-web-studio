import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Shield, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ppswzLogo from "@/assets/ppswz-logo.jpg";

const navItems = [
  { label: "Home", href: "home" },
  { label: "About", href: "about" },
  { label: "Services", href: "services" },
  { label: "Membership", href: "membership" },
  { label: "Contact", href: "contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    
    const scrollTo = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    };

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollTo, 150);
    } else {
      scrollTo();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container-max">
        <div className="flex items-center justify-between h-20 px-4 md:px-8">
          {/* Logo */}
          <button onClick={() => scrollToSection("home")} className="flex items-center gap-3">
            <img
              src={ppswzLogo}
              alt="PPSWZ Logo"
              className="h-12 w-12 rounded-full object-cover shadow-soft"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-heading font-bold text-primary leading-tight">
                PPSWZ
              </h1>
              <p className="text-xs text-muted-foreground">Zanzibar</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-300"
              >
                {item.label}
              </button>
            ))}
            
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-card border-t border-border"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.href)}
                    className="block text-base font-medium text-foreground/80 hover:text-primary transition-colors duration-300 w-full text-left"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="space-y-2 mt-4">
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full gap-2">
                          <User className="w-4 h-4" />
                          Dashboard
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="secondary" className="w-full gap-2">
                            <Shield className="w-4 h-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button variant="ghost" className="w-full gap-2" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full gap-2">
                        <LogIn className="w-4 h-4" />
                        Login / Sign Up
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
