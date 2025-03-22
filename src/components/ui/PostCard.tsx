
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { Post } from '../../data/posts';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    // Implementation would depend on sharing functionality
    navigator.clipboard.writeText(window.location.origin + '/blog/' + post.id);
    alert('Ссылка скопирована в буфер обмена!');
  };
  
  return (
    <Link 
      to={`/blog/${post.id}`} 
      className="block"
    >
      <article className="glass-card rounded-2xl overflow-hidden card-hover h-full flex flex-col">
        {post.coverImage && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-accent/20 text-accent">
              {post.category}
            </span>
          </div>
          
          <h3 className="heading-sm mb-2">{post.title}</h3>
          
          <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
          
          <div className="flex items-center mt-auto">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-xs text-gray-400">
                {new Date(post.date).toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center mt-4 pt-4 border-t border-white/10">
            <button 
              onClick={handleLike}
              className="flex items-center mr-4 text-sm text-gray-400 hover:text-accent transition-colors"
            >
              <Heart size={16} className={liked ? 'fill-accent text-accent' : ''} />
              <span className="ml-1">{likeCount}</span>
            </button>
            
            <div className="flex items-center mr-4 text-sm text-gray-400">
              <MessageSquare size={16} />
              <span className="ml-1">{post.comments}</span>
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center text-sm text-gray-400 hover:text-accent transition-colors ml-auto"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};
