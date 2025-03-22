
import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PostCard } from '../components/ui/PostCard';
import { getRecentPosts, Post } from '../data/posts';
import { Search } from 'lucide-react';

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      const allPosts = getRecentPosts();
      setPosts(allPosts);
      setFilteredPosts(allPosts);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (posts.length === 0) return;
    
    let result = [...posts];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(query) || 
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(result);
  }, [searchQuery, selectedCategory, posts]);
  
  const getUniqueCategories = () => {
    const categories = posts.map(post => post.category);
    return ['Все', ...new Set(categories)];
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'Все' ? null : category);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-24 page-transition">
        {/* Header */}
        <section className="py-12 md:py-16">
          <div className="layout-container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-xl mb-4">Блог</h1>
              <p className="text-xl text-gray-300 mb-8">
                Статьи о веб-разработке, дизайне и технологиях
              </p>
            </div>
          </div>
        </section>
        
        {/* Search and Filters */}
        <section className="pb-12">
          <div className="layout-container">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Поиск статей..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {getUniqueCategories().map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`
                        px-4 py-2 rounded-full text-sm border transition-colors
                        ${selectedCategory === category || (category === 'Все' && !selectedCategory)
                          ? 'bg-accent text-white border-accent'
                          : 'border-white/20 hover:border-accent/50 hover:text-accent'
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Blog Posts */}
        <section className="py-12">
          <div className="layout-container">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
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
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="heading-md mb-4">Статьи не найдены</h3>
                <p className="text-gray-400 mb-8">
                  Попробуйте изменить параметры поиска или категорию
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent/90 transition-colors duration-300"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${0.05 * (index % 6)}s` }}
                  >
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
