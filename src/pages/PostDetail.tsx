import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PostCard } from '../components/ui/PostCard';
import { Heart, MessageSquare, Share2, ArrowLeft, Calendar, ChevronRight, User, Trash2 } from 'lucide-react';
import { Post } from '../data/posts';
import { useToast } from '../hooks/use-toast';
import { 
  getPostById, 
  getRelatedPosts, 
  getCommentsByPostId, 
  addComment, 
  deleteComment,
  hasUserLiked,
  addLike, 
  removeLike,
  Comment as DbComment
} from '../lib/db';

interface CommentFormData {
  author: string;
  content: string;
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentForm, setCommentForm] = useState<CommentFormData>({
    author: '',
    content: ''
  });
  const [comments, setComments] = useState<DbComment[]>([]);
  
  const loadPostData = async () => {
    if (!id) {
      navigate('/blog');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const postData = await getPostById(id);
      
      if (postData) {
        setPost(postData);
        
        const postComments = await getCommentsByPostId(id);
        setComments(postComments);
        
        const userLiked = await hasUserLiked(id);
        setLiked(userLiked);
        
        const related = await getRelatedPosts(id, postData.category);
        setRelatedPosts(related);
        
        const savedAuthor = localStorage.getItem('comment_author_name');
        if (savedAuthor) {
          setCommentForm(prev => ({ ...prev, author: savedAuthor }));
        }
      } else {
        toast({
          title: "Статья не найдена",
          description: "Запрашиваемая статья не существует или была удалена",
          variant: "destructive",
        });
        navigate('/blog');
      }
    } catch (error) {
      console.error('Error loading post data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные статьи",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
    loadPostData();
  }, [id]);
  
  const handleLike = async () => {
    if (!post || !id) return;
    
    try {
      if (liked) {
        await removeLike(id);
        setLiked(false);
        setPost(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : null);
        
        toast({
          title: "Лайк отменен",
          description: "Вы отменили лайк статьи",
          duration: 2000,
        });
      } else {
        await addLike(id);
        setLiked(true);
        setPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
        
        toast({
          title: "Вы поставили лайк!",
          description: "Спасибо за вашу оценку!",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус лайка",
        variant: "destructive",
      });
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на статью скопирована в буфер обмена",
      duration: 2000,
    });
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post || !id) return;
    
    if (!commentForm.content.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите текст комментария",
        variant: "destructive",
      });
      return;
    }
    
    if (!commentForm.author.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите ваше имя",
        variant: "destructive",
      });
      return;
    }
    
    try {
      localStorage.setItem('comment_author_name', commentForm.author);
      
      const newComment: DbComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        postId: id,
        author: commentForm.author,
        content: commentForm.content,
        date: new Date().toISOString()
      };
      
      const success = await addComment(newComment);
      
      if (success) {
        setComments(prev => [newComment, ...prev]);
        setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
        setCommentForm(prev => ({ ...prev, content: '' }));
        
        toast({
          title: "Комментарий добавлен",
          description: "Ваш комментарий успешно опубликован",
        });
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить комментарий",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      try {
        const success = await deleteComment(commentId, id);
        
        if (success) {
          setComments(prev => prev.filter(comment => comment.id !== commentId));
          setPost(prev => prev ? { ...prev, comments: Math.max(0, prev.comments - 1) } : null);
          
          toast({
            title: "Комментарий удален",
            description: "Комментарий был успешно удален",
          });
        } else {
          throw new Error('Failed to delete comment');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить комментарий",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow mt-24 flex items-center justify-center page-transition">
          <div className="text-center">
            <div className="inline-block animate-spin h-12 w-12 border-4 border-white/20 border-t-accent rounded-full mb-4"></div>
            <p className="text-xl text-gray-300">Загрузка статьи...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (!post) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-24 page-transition">
        <header className="py-12 md:py-16">
          <div className="layout-container">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center text-gray-400 hover:text-accent transition-colors"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Вернуться к блогу
                </Link>
              </div>
              
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm bg-accent/20 text-accent">
                  {post.category}
                </span>
              </div>
              
              <h1 className="heading-xl mb-6">{post.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(post.date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="mb-12">
          <div className="layout-container">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
        
        <section className="py-8">
          <div className="layout-container">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl p-6 md:p-10">
                <article className="prose-custom">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
                
                <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                  <button 
                    onClick={handleLike}
                    className={`
                      flex items-center px-4 py-2 rounded-full transition-colors duration-300
                      ${liked ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-300 hover:bg-white/10'}
                    `}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${liked ? 'fill-accent' : ''}`} />
                    <span>{post.likes}</span>
                  </button>
                  
                  <button 
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 transition-colors duration-300"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    Поделиться
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12">
          <div className="layout-container">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl p-6 md:p-10">
                <h3 className="heading-md mb-6">Комментарии</h3>
                
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="mb-4">
                    <label htmlFor="authorName" className="block text-sm font-medium mb-2">Ваше имя</label>
                    <input
                      id="authorName"
                      type="text"
                      value={commentForm.author}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="commentText" className="block text-sm font-medium mb-2">Ваш комментарий</label>
                    <textarea
                      id="commentText"
                      value={commentForm.content}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-white/10 focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Оставьте свой комментарий..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 transition-colors duration-300"
                    >
                      Отправить
                    </button>
                  </div>
                </form>
                
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">
                      <p>Пока не�� комментариев. Будьте первым, кто оставит комментарий!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                <User size={16} className="text-accent" />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">{comment.author}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(comment.date).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            title="Удалить комментарий"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-gray-300 pl-11">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-black/20">
            <div className="layout-container">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <h2 className="heading-lg mb-4 md:mb-0">Похожие статьи</h2>
                <Link 
                  to="/blog" 
                  className="text-accent hover:text-accent/80 hover-link transition-colors inline-flex items-center"
                >
                  Все статьи
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.id}>
                    <PostCard post={relatedPost} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default PostDetail;
