
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Edit, Plus, Trash2, LogOut, Eye } from 'lucide-react';
import { posts as initialPosts, Post } from '../data/posts';

const Admin = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);
      
      if (!isLoggedIn) {
        navigate('/login');
      } else {
        // Load posts
        setTimeout(() => {
          setPosts(initialPosts);
          setIsLoading(false);
        }, 500);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      setPosts(prev => prev.filter(post => post.id !== id));
    }
  };
  
  const handleAddPost = () => {
    alert('В этой демо-версии функционал добавления статей не реализован полностью.');
  };
  
  const handleEditPost = (id: string) => {
    alert(`В этой демо-версии функционал редактирования статьи (ID: ${id}) не реализован полностью.`);
  };
  
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-24 page-transition">
        {/* Header */}
        <section className="py-8">
          <div className="layout-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="heading-lg mb-2">Админ-панель</h1>
                <p className="text-gray-400">
                  Управление контентом блога
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-4">
                <button
                  onClick={handleAddPost}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Новая статья
                </button>
                
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-300"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Posts Table */}
        <section className="py-8">
          <div className="layout-container">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin h-8 w-8 border-4 border-white/20 border-t-accent rounded-full mb-4"></div>
                    <p className="text-gray-400">Загрузка статей...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xl mb-4">Статьи не найдены</p>
                    <button
                      onClick={handleAddPost}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Добавить первую статью
                    </button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Название</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Категория</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Дата</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Комментарии</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Лайки</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center">
                              {post.coverImage && (
                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                  <img 
                                    src={post.coverImage} 
                                    alt={post.title} 
                                    className="h-10 w-10 rounded-md object-cover"
                                  />
                                </div>
                              )}
                              <div className="truncate max-w-xs">{post.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <span className="inline-block px-2 py-1 rounded-full text-xs bg-accent/20 text-accent">
                              {post.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(post.date).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {post.comments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {post.likes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => navigate(`/blog/${post.id}`)}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                                aria-label="Просмотр"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEditPost(post.id)}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                                aria-label="Редактировать"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="p-2 rounded-full hover:bg-red-500/10 text-gray-300 hover:text-red-500 transition-colors"
                                aria-label="Удалить"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
