
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatedLink } from '../ui/AnimatedLink';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Главная', path: '/' },
    { name: 'Блог', path: '/blog' },
    { name: 'Обновления', path: '/updates' },
    { name: 'Контакты', path: '/contact' }
  ];
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-card py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="layout-container">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-bold text-gradient">Мой блог</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <AnimatedLink 
                key={link.path} 
                to={link.path} 
                isActive={location.pathname === link.path}
              >
                {link.name}
              </AnimatedLink>
            ))}
            <div className="ml-6">
              <Link 
                to="/login" 
                className="px-5 py-2 rounded-full bg-accent hover:bg-accent/90 transition-colors duration-300"
              >
                Войти
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden neo-blur fixed inset-0 top-[60px] z-40 animate-fade-in">
          <div className="flex flex-col items-center justify-center h-full space-y-8 px-4">
            {navLinks.map((link) => (
              <AnimatedLink 
                key={link.path} 
                to={link.path} 
                isActive={location.pathname === link.path}
                className="text-xl"
              >
                {link.name}
              </AnimatedLink>
            ))}
            <div className="mt-4">
              <Link 
                to="/login" 
                className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent/90 transition-colors duration-300 text-lg"
              >
                Войти
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
