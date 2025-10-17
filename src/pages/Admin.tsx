
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { 
  Edit, Plus, Trash2, LogOut, Eye, Star, Upload, Settings as SettingsIcon, 
  FileText, Users, Mail, Save, X as CloseIcon
} from 'lucide-react';
import { Post, author } from '../data/posts';
import { useToast } from '../hooks/use-toast';
import { 
  getPosts, 
  addPost, 
  updatePost, 
  deletePost,
  getFeaturedPosts,
  updateFeaturedPosts,
  getUpdates,
  addUpdate,
  updateUpdate,
  deleteUpdate,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getSetting,
  setSetting,
  Update,
  Contact
} from '../lib/db';
import { isSessionValid, logout, initSessionMonitoring, cleanupSessionMonitoring } from '../lib/auth';

type Tab = 'posts' | 'updates' | 'contacts' | 'settings';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [featuredPostIds, setFeaturedPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isShowingPostForm, setIsShowingPostForm] = useState(false);
  const [isShowingUpdateForm, setIsShowingUpdateForm] = useState(false);
  const [isShowingContactForm, setIsShowingContactForm] = useState(false);
  const [isShowingFeaturedForm, setIsShowingFeaturedForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [adminAvatar, setAdminAvatar] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const { toast } = useToast();
  
  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postCoverImage, setPostCoverImage] = useState('');
  
  // Update form state
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateType, setUpdateType] = useState<'feature' | 'improvement' | 'fix'>('feature');
  
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone' | 'telegram' | 'whatsapp' | 'other'>('email');
  
  const formRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  
  // Load all data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [allPosts, allUpdates, allContacts, featured, avatar] = await Promise.all([
        getPosts(),
        getUpdates(),
        getContacts(),
        getFeaturedPosts(),
        getSetting('adminAvatar')
      ]);
      
      setPosts(allPosts);
      setUpdates(allUpdates);
      setContacts(allContacts);
      setFeaturedPostIds(featured.map(post => post.id));
      setAdminAvatar(avatar || author.avatar);
      setAvatarPreview(avatar || author.avatar);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const isValid = isSessionValid();
      setIsAuthenticated(isValid);
      
      if (!isValid) {
        navigate('/login');
      } else {
        loadAllData();
        initSessionMonitoring();
      }
    };
    
    checkAuth();
    
    return () => {
      cleanupSessionMonitoring();
    };
  }, [navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Avatar handling
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Неверный формат",
        description: "Пожалуйста, загрузите изображение JPG или PNG",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла 2MB",
        variant: "destructive",
      });
      return;
    }
    
    // Read and preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSaveAvatar = async () => {
    try {
      await setSetting('adminAvatar', avatarPreview);
      setAdminAvatar(avatarPreview);
      toast({
        title: "Аватарка обновлена",
        description: "Новая аватарка успешно сохранена",
      });
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить аватарку",
        variant: "destructive",
      });
    }
  };
  
  // Post operations
  const handleDeletePost = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      try {
        const success = await deletePost(id);
        
        if (success) {
          setPosts(posts.filter(post => post.id !== id));
          
          if (featuredPostIds.includes(id)) {
            const newFeatured = featuredPostIds.filter(postId => postId !== id);
            setFeaturedPostIds(newFeatured);
            await updateFeaturedPosts(newFeatured);
          }
          
          toast({
            title: "Статья удалена",
            description: "Статья была успешно удалена",
          });
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить статью",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postTitle.trim() || !postExcerpt.trim() || !postContent.trim() || !postCategory.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingPost) {
        const updatedPost: Post = { 
          ...editingPost, 
          title: postTitle, 
          excerpt: postExcerpt, 
          content: postContent, 
          category: postCategory, 
          coverImage: postCoverImage || undefined 
        };
        
        await updatePost(updatedPost);
        setPosts(posts.map(post => post.id === editingPost.id ? updatedPost : post));
        
        toast({
          title: "Статья обновлена",
          description: "Статья была успешно обновлена",
        });
      } else {
        const newPost: Post = {
          id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: postTitle,
          excerpt: postExcerpt,
          content: postContent,
          category: postCategory,
          author,
          date: new Date().toISOString(),
          likes: 0,
          comments: 0,
          coverImage: postCoverImage || undefined
        };
        
        await addPost(newPost);
        setPosts([...posts, newPost]);
        
        toast({
          title: "Статья создана",
          description: "Новая статья была успешно создана",
        });
      }
      
      resetPostForm();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить статью",
        variant: "destructive",
      });
    }
  };
  
  const resetPostForm = () => {
    setPostTitle('');
    setPostExcerpt('');
    setPostContent('');
    setPostCategory('');
    setPostCoverImage('');
    setEditingPost(null);
    setIsShowingPostForm(false);
  };
  
  // Update operations
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateTitle.trim() || !updateDescription.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingUpdate) {
        const updated: Update = {
          ...editingUpdate,
          title: updateTitle,
          description: updateDescription,
          type: updateType
        };
        
        await updateUpdate(updated);
        setUpdates(updates.map(u => u.id === editingUpdate.id ? updated : u));
        
        toast({
          title: "Обновление изменено",
          description: "Обновление было успешно изменено",
        });
      } else {
        const newUpdate: Update = {
          id: `update-${Date.now()}`,
          title: updateTitle,
          description: updateDescription,
          date: new Date().toISOString(),
          type: updateType
        };
        
        await addUpdate(newUpdate);
        setUpdates([newUpdate, ...updates]);
        
        toast({
          title: "Обновление создано",
          description: "Новое обновление было успешно создано",
        });
      }
      
      resetUpdateForm();
    } catch (error) {
      console.error('Error saving update:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить обновление",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteUpdate = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это обновление?')) {
      try {
        await deleteUpdate(id);
        setUpdates(updates.filter(u => u.id !== id));
        
        toast({
          title: "Обновление удалено",
          description: "Обновление было успешно удалено",
        });
      } catch (error) {
        console.error('Error deleting update:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить обновление",
          variant: "destructive",
        });
      }
    }
  };
  
  const resetUpdateForm = () => {
    setUpdateTitle('');
    setUpdateDescription('');
    setUpdateType('feature');
    setEditingUpdate(null);
    setIsShowingUpdateForm(false);
  };
  
  // Contact operations
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactName.trim() || !contactValue.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingContact) {
        const updated: Contact = {
          ...editingContact,
          name: contactName,
          value: contactValue,
          type: contactType
        };
        
        await updateContact(updated);
        setContacts(contacts.map(c => c.id === editingContact.id ? updated : c));
        
        toast({
          title: "Контакт изменен",
          description: "Контакт был успешно изменен",
        });
      } else {
        const newContact: Contact = {
          id: `contact-${Date.now()}`,
          name: contactName,
          value: contactValue,
          type: contactType,
          order: contacts.length
        };
        
        await addContact(newContact);
        setContacts([...contacts, newContact]);
        
        toast({
          title: "Контакт создан",
          description: "Новый контакт был успешно создан",
        });
      }
      
      resetContactForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить контакт",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот контакт?')) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter(c => c.id !== id));
        
        toast({
          title: "Контакт удален",
          description: "Контакт был успешно удален",
        });
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить контакт",
          variant: "destructive",
        });
      }
    }
  };
  
  const resetContactForm = () => {
    setContactName('');
    setContactValue('');
    setContactType('email');
    setEditingContact(null);
    setIsShowingContactForm(false);
  };
  
  // Featured posts
  const handleToggleFeatured = (postId: string) => {
    const newFeatured = [...featuredPostIds];
    
    if (newFeatured.includes(postId)) {
      const index = newFeatured.indexOf(postId);
      newFeatured.splice(index, 1);
    } else {
      if (newFeatured.length < 3) {
        newFeatured.push(postId);
      } else {
        toast({
          title: "Превышено ограничение",
          description: "Можно выбрать максимум 3 избранные статьи",
          variant: "destructive",
        });
        return;
      }
    }
    
    setFeaturedPostIds(newFeatured);
  };
  
  const handleSaveFeatured = async () => {
    try {
      await updateFeaturedPosts(featuredPostIds);
      
      toast({
        title: "Избранные статьи обновлены",
        description: "Список избранных статей успешно обновлен",
      });
      setIsShowingFeaturedForm(false);
    } catch (error) {
      console.error('Error updating featured posts:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранные статьи",
        variant: "destructive",
      });
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  const getUpdateTypeStyles = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return 'bg-accent/20 text-accent';
      case 'improvement':
        return 'bg-blue-900/20 text-blue-400';
      case 'fix':
        return 'bg-amber-900/20 text-amber-400';
    }
  };
  
  const getContactTypeIcon = (type: Contact['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'phone':
        return <FileText className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };
  
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
              
              <button
                onClick={handleLogout}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-300"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Выйти
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-2 mb-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'posts' 
                    ? 'bg-accent text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <FileText className="mr-2 h-5 w-5" />
                Статьи
              </button>
              
              <button
                onClick={() => setActiveTab('updates')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'updates' 
                    ? 'bg-accent text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Star className="mr-2 h-5 w-5" />
                Обновления
              </button>
              
              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'contacts' 
                    ? 'bg-accent text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Mail className="mr-2 h-5 w-5" />
                Контакты
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-accent text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <SettingsIcon className="mr-2 h-5 w-5" />
                Настройки
              </button>
            </div>
          </div>
        </section>
        
        {/* Content based on active tab */}
        {activeTab === 'posts' && (
          <section className="py-8">
            <div className="layout-container">
              <div className="flex justify-between mb-6">
                <h2 className="heading-md">Управление статьями</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setIsShowingPostForm(true);
                      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Новая статья
                  </button>
                  
                  <button
                    onClick={() => setIsShowingFeaturedForm(true)}
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors duration-300"
                  >
                    <Star className="mr-2 h-5 w-5" />
                    Избранные
                  </button>
                </div>
              </div>
              
              {isShowingPostForm && (
                <div className="glass-card rounded-2xl p-6 md:p-10 mb-8" ref={formRef}>
                  <h3 className="heading-sm mb-6">{editingPost ? 'Редактировать статью' : 'Создать статью'}</h3>
                  
                  <form onSubmit={handleSubmitPost}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Заголовок *</label>
                          <input
                            type="text"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Категория *</label>
                          <input
                            type="text"
                            value={postCategory}
                            onChange={(e) => setPostCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Краткое описание *</label>
                        <textarea
                          value={postExcerpt}
                          onChange={(e) => setPostExcerpt(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors resize-none"
                          rows={2}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Содержание *</label>
                        <textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                          rows={10}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Ссылка на изображение</label>
                        <input
                          type="text"
                          value={postCoverImage}
                          onChange={(e) => setPostCoverImage(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={resetPostForm}
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
              )}
              
              {isShowingFeaturedForm && (
                <div className="glass-card rounded-2xl p-6 md:p-10 mb-8">
                  <h3 className="heading-sm mb-6">Избранные статьи</h3>
                  <p className="text-gray-300 mb-6">
                    Выберите до 3 статей для главной страницы
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {posts.map((post) => (
                      <div key={post.id} className="flex items-center p-4 bg-white/5 rounded-lg">
                        <button
                          onClick={() => handleToggleFeatured(post.id)}
                          className={`p-2 rounded-full mr-4 transition-colors ${
                            featuredPostIds.includes(post.id) 
                              ? 'bg-accent/20 text-accent' 
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          <Star className={`h-5 w-5 ${featuredPostIds.includes(post.id) ? 'fill-accent' : ''}`} />
                        </button>
                        
                        <div className="flex-grow">
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(post.date).toLocaleDateString('ru-RU')} | {post.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsShowingFeaturedForm(false)}
                      className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-300"
                    >
                      Отмена
                    </button>
                    
                    <button
                      onClick={handleSaveFeatured}
                      className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              )}
              
              {/* Posts list */}
              <div className="grid gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="glass-card rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="heading-sm mb-2">{post.title}</h3>
                        <p className="text-gray-300 mb-4">{post.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-400 space-x-4">
                          <span>{new Date(post.date).toLocaleDateString('ru-RU')}</span>
                          <span>{post.category}</span>
                          <span>{post.likes} лайков</span>
                          <span>{post.comments} комментариев</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setPostTitle(post.title);
                            setPostExcerpt(post.excerpt);
                            setPostContent(post.content);
                            setPostCategory(post.category);
                            setPostCoverImage(post.coverImage || '');
                            setIsShowingPostForm(true);
                            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => navigate(`/blog/${post.id}`)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {activeTab === 'updates' && (
          <section className="py-8">
            <div className="layout-container">
              <div className="flex justify-between mb-6">
                <h2 className="heading-md">Обновления блога</h2>
                <button
                  onClick={() => {
                    setEditingUpdate(null);
                    setIsShowingUpdateForm(true);
                    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Новое обновление
                </button>
              </div>
              
              {isShowingUpdateForm && (
                <div className="glass-card rounded-2xl p-6 md:p-10 mb-8" ref={formRef}>
                  <h3 className="heading-sm mb-6">{editingUpdate ? 'Редактировать обновление' : 'Создать обновление'}</h3>
                  
                  <form onSubmit={handleSubmitUpdate}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Заголовок *</label>
                        <input
                          type="text"
                          value={updateTitle}
                          onChange={(e) => setUpdateTitle(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Описание *</label>
                        <textarea
                          value={updateDescription}
                          onChange={(e) => setUpdateDescription(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors resize-none"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Тип *</label>
                        <select
                          value={updateType}
                          onChange={(e) => setUpdateType(e.target.value as 'feature' | 'improvement' | 'fix')}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                        >
                          <option value="feature">Новая функция</option>
                          <option value="improvement">Улучшение</option>
                          <option value="fix">Исправление</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={resetUpdateForm}
                        className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-300"
                      >
                        Отмена
                      </button>
                      
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                      >
                        {editingUpdate ? 'Сохранить изменения' : 'Создать обновление'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Updates list */}
              <div className="grid gap-6">
                {updates.map((update) => (
                  <div key={update.id} className="glass-card rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${getUpdateTypeStyles(update.type)}`}>
                            {update.type === 'feature' ? 'Новая функция' : update.type === 'improvement' ? 'Улучшение' : 'Исправление'}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(update.date).toLocaleDateString('ru-RU', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        <h3 className="heading-sm mb-2">{update.title}</h3>
                        <p className="text-gray-300">{update.description}</p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingUpdate(update);
                            setUpdateTitle(update.title);
                            setUpdateDescription(update.description);
                            setUpdateType(update.type);
                            setIsShowingUpdateForm(true);
                            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUpdate(update.id)}
                          className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {activeTab === 'contacts' && (
          <section className="py-8">
            <div className="layout-container">
              <div className="flex justify-between mb-6">
                <h2 className="heading-md">Контакты</h2>
                <button
                  onClick={() => {
                    setEditingContact(null);
                    setIsShowingContactForm(true);
                    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Новый контакт
                </button>
              </div>
              
              {isShowingContactForm && (
                <div className="glass-card rounded-2xl p-6 md:p-10 mb-8" ref={formRef}>
                  <h3 className="heading-sm mb-6">{editingContact ? 'Редактировать контакт' : 'Создать контакт'}</h3>
                  
                  <form onSubmit={handleSubmitContact}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Название *</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                          placeholder="Например: Email"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Значение *</label>
                        <input
                          type="text"
                          value={contactValue}
                          onChange={(e) => setContactValue(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                          placeholder="Например: email@example.com"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Тип *</label>
                        <select
                          value={contactType}
                          onChange={(e) => setContactType(e.target.value as Contact['type'])}
                          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Телефон</option>
                          <option value="telegram">Telegram</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="other">Другое</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={resetContactForm}
                        className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/5 transition-colors duration-300"
                      >
                        Отмена
                      </button>
                      
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                      >
                        {editingContact ? 'Сохранить изменения' : 'Создать контакт'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Contacts list */}
              <div className="grid gap-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="glass-card rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center flex-grow">
                        <div className="p-3 rounded-full bg-white/5 mr-4">
                          {getContactTypeIcon(contact.type)}
                        </div>
                        <div>
                          <h3 className="heading-sm mb-1">{contact.name}</h3>
                          <p className="text-gray-300">{contact.value}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingContact(contact);
                            setContactName(contact.name);
                            setContactValue(contact.value);
                            setContactType(contact.type);
                            setIsShowingContactForm(true);
                            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {activeTab === 'settings' && (
          <section className="py-8">
            <div className="layout-container">
              <h2 className="heading-md mb-6">Настройки</h2>
              
              <div className="glass-card rounded-2xl p-6 md:p-10">
                <h3 className="heading-sm mb-6">Аватарка администратора</h3>
                
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={avatarPreview} 
                      alt="Admin avatar" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-accent/20"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 mb-3"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Загрузить новую аватарку
                    </button>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      Форматы: JPG, PNG. Максимальный размер: 2MB
                    </p>
                    
                    {avatarPreview !== adminAvatar && (
                      <button
                        onClick={handleSaveAvatar}
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                      >
                        <Save className="mr-2 h-5 w-5" />
                        Сохранить аватарку
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
