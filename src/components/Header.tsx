import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ppswzLogo from "@/assets/ppswz-logo.jpg";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Membership", href: "#membership" },
  { label: "Contact", href: "#contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container-max">
        <div className="flex items-center justify-between h-20 px-4 md:px-8">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
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
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <Button size="sm">Join Us</Button>
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
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-base font-medium text-foreground/80 hover:text-primary transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                ))}
                <Button className="w-full mt-4">Join Us</Button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
