
import { Link } from 'react-router-dom';
import { Github, Mail, Globe } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-12 glass-card">
      <div className="layout-container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-xl font-bold text-gradient">
              Мой блог
            </Link>
            <p className="mt-2 text-sm text-gray-400 max-w-md">
              Личный блог с размышлениями, идеями и заметками для друзей и коллег.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://example.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors duration-200"
                aria-label="Website"
              >
                <Globe size={20} />
              </a>
              <Link 
                to="/contact"
                className="hover:text-accent transition-colors duration-200"
                aria-label="Contact"
              >
                <Mail size={20} />
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              © {currentYear} Мой блог. Все права защищены.
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link to="/" className="hover-link">Главная</Link>
            <Link to="/blog" className="hover-link">Блог</Link>
            <Link to="/updates" className="hover-link">Обновления</Link>
            <Link to="/contact" className="hover-link">Контакты</Link>
          </div>
          <div>
            <Link to="/login" className="hover-link">Админ панель</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
