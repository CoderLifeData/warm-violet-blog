
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { PostCard } from '../components/ui/PostCard';
import { Heart, MessageSquare, Share2, ArrowLeft, Calendar, ChevronRight } from 'lucide-react';
import { getPostById, getRelatedPosts, Post } from '../data/posts';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    // Scroll to top when post changes
    window.scrollTo(0, 0);
    
    if (!id) {
      navigate('/blog');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate data loading
    const timer = setTimeout(() => {
      const foundPost = getPostById(id);
      
      if (foundPost) {
        setPost(foundPost);
        setLikeCount(foundPost.likes);
        
        // Get related posts
        const related = getRelatedPosts(id, foundPost.category);
        setRelatedPosts(related);
      } else {
        navigate('/blog');
      }
      
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id, navigate]);
  
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Ссылка скопирована в буфер обмена!');
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    // In a real app, this would send the comment to a backend
    alert('В этой демо-версии комментарии не сохраняются на сервере.');
    setCommentText('');
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
        {/* Post Header */}
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
        
        {/* Post Cover Image */}
        {post.coverImage && (
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
        )}
        
        {/* Post Content */}
        <section className="py-8">
          <div className="layout-container">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl p-6 md:p-10">
                <article className="prose-custom">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
                
                {/* Post Actions */}
                <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                  <button 
                    onClick={handleLike}
                    className={`
                      flex items-center px-4 py-2 rounded-full transition-colors duration-300
                      ${liked ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-300 hover:bg-white/10'}
                    `}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${liked ? 'fill-accent' : ''}`} />
                    <span>{likeCount}</span>
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
        
        {/* Comments Section */}
        <section className="py-12">
          <div className="layout-container">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl p-6 md:p-10">
                <h3 className="heading-md mb-6">Комментарии</h3>
                
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="mb-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
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
                  <div className="text-gray-400 text-center py-4">
                    <p>В этой демо-версии комментарии не отображаются.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Posts */}
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
