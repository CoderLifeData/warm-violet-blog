
import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PostCard } from '../components/ui/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getPosts, Post } from '../lib/db';

// Unique categories extraction
const getUniqueCategories = (posts: Post[]): string[] => {
  const categories = posts.map(post => post.category);
  return Array.from(new Set(categories));
};

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const allPosts = await getPosts();
        
        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setPosts(allPosts);
        setFilteredPosts(allPosts);
        
        // Extract unique categories
        const uniqueCategories = getUniqueCategories(allPosts);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
  }, []);
  
  useEffect(() => {
    // Apply category and search filters
    let results = posts;
    
    // Apply category filter
    if (activeCategory !== 'all') {
      results = results.filter(post => post.category === activeCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        post => 
          post.title.toLowerCase().includes(term) ||
          post.excerpt.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term) ||
          post.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredPosts(results);
  }, [activeCategory, searchTerm, posts]);
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-24 page-transition">
        {/* Blog Header */}
        <section className="py-12 md:py-16">
          <div className="layout-container">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="heading-xl mb-6">Блог</h1>
              <p className="text-xl text-gray-300 mb-8">
                Статьи о веб-разработке, дизайне и технологиях
              </p>
              
              {/* Search Input */}
              <div className="relative max-w-md mx-auto mb-8">
                <input
                  type="text"
                  placeholder="Поиск статей..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-3 pl-10 rounded-full bg-white/5 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                />
                <svg 
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>
        
        {/* Categories */}
        <section className="pb-8">
          <div className="layout-container">
            <Tabs defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
              <div className="overflow-x-auto pb-2">
                <TabsList className="bg-white/5 border border-white/10 p-1">
                  <TabsTrigger value="all" className="rounded-full">
                    Все статьи
                  </TabsTrigger>
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="rounded-full">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              <TabsContent value="all">
                <div className="mt-8">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[1, 2, 3, 4].map((_, index) => (
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
                    <div className="text-center py-12">
                      <p className="text-xl mb-4">Статьи не найдены</p>
                      <p className="text-gray-400">Попробуйте изменить параметры поиска или выбрать другую категорию</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {filteredPosts.map((post) => (
                        <div key={post.id}>
                          <PostCard post={post} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {categories.map(category => (
                <TabsContent key={category} value={category}>
                  <div className="mt-8">
                    {filteredPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-xl mb-4">Статьи не найдены</p>
                        <p className="text-gray-400">В категории {category} нет статей, соответствующих критериям поиска</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPosts.map((post) => (
                          <div key={post.id}>
                            <PostCard post={post} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
