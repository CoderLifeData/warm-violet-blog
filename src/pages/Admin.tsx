
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Edit, Plus, Trash2, LogOut, Eye } from 'lucide-react';
import { posts as initialPosts, Post, author } from '../data/posts';
import { useToast } from '../hooks/use-toast';

const Admin = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isShowingForm, setIsShowingForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  
  const formRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsAuthenticated(isLoggedIn);
      
      if (!isLoggedIn) {
        navigate('/login');
      } else {
        // Load posts from localStorage or use initial posts
        const savedPosts = localStorage.getItem('blog_posts');
        if (savedPosts) {
          setPosts(JSON.parse(savedPosts));
        } else {
          setPosts(initialPosts);
          localStorage.setItem('blog_posts', JSON.stringify(initialPosts));
        }
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  useEffect(() => {
    // Reset form when editing post changes
    if (editingPost) {
      setTitle(editingPost.title);
      setExcerpt(editingPost.excerpt);
      setContent(editingPost.content);
      setCategory(editingPost.category);
      setCoverImage(editingPost.coverImage || '');
    } else {
      resetForm();
    }
  }, [editingPost]);
  
  const resetForm = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('');
    setCoverImage('');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      const updatedPosts = posts.filter(post => post.id !== id);
      setPosts(updatedPosts);
      localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
      
      toast({
        title: "Статья удалена",
        description: "Статья была успешно удалена",
      });
    }
  };
  
  const handleAddPost = () => {
    setEditingPost(null);
    setIsShowingForm(true);
    
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleEditPost = (id: string) => {
    const postToEdit = posts.find(post => post.id === id);
    if (postToEdit) {
      setEditingPost(postToEdit);
      setIsShowingForm(true);
      
      // Scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !excerpt.trim() || !content.trim() || !category.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }
    
    if (editingPost) {
      // Update existing post
      const updatedPosts = posts.map(post => 
        post.id === editingPost.id 
          ? { 
              ...post, 
              title, 
              excerpt, 
              content, 
              category, 
              coverImage: coverImage || undefined 
            } 
          : post
      );
      
      setPosts(updatedPosts);
      localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
      
      toast({
        title: "Статья обновлена",
        description: "Статья была успешно обновлена",
      });
    } else {
      // Create new post
      const newPost: Post = {
        id: `post-${Date.now()}`,
        title,
        excerpt,
        content,
        category,
        author,
        date: new Date().toISOString(),
        likes: 0,
        comments: 0,
      };
      
      if (coverImage) {
        newPost.coverImage = coverImage;
      }
      
      const updatedPosts = [...posts, newPost];
      setPosts(updatedPosts);
      localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
      
      toast({
        title: "Статья создана",
        description: "Новая статья была успешно создана",
      });
    }
    
    // Reset form and state
    resetForm();
    setEditingPost(null);
    setIsShowingForm(false);
  };
  
  const handleCancelForm = () => {
    setIsShowingForm(false);
    setEditingPost(null);
    resetForm();
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
        
        {/* Post Form */}
        {isShowingForm && (
          <section className="py-8" ref={formRef}>
            <div className="layout-container">
              <div className="glass-card rounded-2xl p-6 md:p-10">
                <h2 className="heading-md mb-6">{editingPost ? 'Редактировать статью' : 'Создать новую статью'}</h2>
                
                <form onSubmit={handleSubmitPost}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">Заголовок *</label>
                        <input
                          id="title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                          placeholder="Введите заголовок статьи"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-2">Категория *</label>
                        <input
                          id="category"
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                          placeholder="Введите категорию"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="excerpt" className="block text-sm font-medium mb-2">Краткое описание *</label>
                      <textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors resize-none"
                        placeholder="Краткое описание статьи"
                        rows={2}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium mb-2">Содержание *</label>
                      <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                        placeholder="Содержание статьи (HTML разметка)"
                        rows={10}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="coverImage" className="block text-sm font-medium mb-2">Ссылка на изображение</label>
                      <input
                        id="coverImage"
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                        placeholder="Введите URL изображения"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-300"
                    >
                      Отмена
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                    >
                      {editingPost ? 'Сохранить изменения' : 'Создать статью'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}
        
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
