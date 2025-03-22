
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PostCard } from '../components/ui/PostCard';
import { Post } from '../data/posts';
import { getFeaturedPosts } from '../lib/db';

const Index = () => {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadFeaturedPosts = async () => {
      setIsLoading(true);
      try {
        const posts = await getFeaturedPosts();
        setFeaturedPosts(posts);
      } catch (error) {
        console.error('Error loading featured posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedPosts();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-24 page-transition">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="layout-container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-xl mb-6 animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
                Мысли, идеи и размышления
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
                Делюсь своим опытом в веб-разработке, дизайне и технологиях
              </p>
              <div className="animate-slide-in-bottom" style={{ animationDelay: '0.5s' }}>
                <Link 
                  to="/blog" 
                  className="inline-flex items-center px-8 py-3 rounded-full bg-accent hover:bg-accent/90 transition-colors duration-300 text-white font-medium"
                >
                  Читать блог
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Posts Section */}
        <section className="py-16 bg-black/20">
          <div className="layout-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
              <h2 className="heading-lg mb-4 md:mb-0">Избранные статьи</h2>
              <Link 
                to="/blog" 
                className="text-accent hover:text-accent/80 hover-link transition-colors inline-flex items-center"
              >
                Все статьи
                <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="glass-card rounded-2xl animate-pulse-slow h-[480px]">
                    <div className="h-48 bg-gray-800/50 rounded-t-2xl"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-800/50 rounded mb-4 w-1/4"></div>
                      <div className="h-8 bg-gray-800/50 rounded mb-4"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-2 w-5/6"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-4 w-4/6"></div>
                      <div className="mt-8 flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-800/50 mr-3"></div>
                        <div>
                          <div className="h-4 bg-gray-800/50 rounded mb-2 w-24"></div>
                          <div className="h-3 bg-gray-800/50 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400">Нет избранных статей. Вы можете добавить их в панели администратора.</p>
                  </div>
                ) : (
                  featuredPosts.map((post, index) => (
                    <div 
                      key={post.id} 
                      className="animate-slide-in-bottom"
                      style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                    >
                      <PostCard post={post} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
        
        {/* About Section */}
        <section className="py-16 md:py-24">
          <div className="layout-container">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 md:p-12 lg:order-2">
                  <h2 className="heading-lg mb-6">О блоге</h2>
                  <p className="text-gray-300 mb-4">
                    Этот блог создан как платформа для обмена знаниями, идеями и опытом в области веб-разработки, дизайна и технологий.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Я верю, что лучший способ углубить собственное понимание — это делиться своими знаниями с другими. Поэтому здесь я публикую статьи о том, что изучаю, с чем работаю и что меня вдохновляет.
                  </p>
                  <p className="text-gray-300 mb-6">
                    Мой опыт охватывает Frontend и Backend разработку, UX/UI дизайн, а также новейшие технологические тренды.
                  </p>
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center px-6 py-2.5 rounded-full border border-accent text-accent hover:bg-accent/10 transition-colors duration-300"
                  >
                    Связаться со мной
                  </Link>
                </div>
                <div className="lg:order-1 h-64 lg:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Рабочее пространство разработчика" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
