
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Calendar } from 'lucide-react';
import { Post } from '../../data/posts';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  // Format date
  const formattedDate = new Date(post.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-scale card-hover">
      <Link to={`/blog/${post.id}`}>
        {post.coverImage && (
          <div className="aspect-[16/9] overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-accent/20 text-accent">
              {post.category}
            </span>
          </div>
          
          <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
          
          <p className="text-gray-300 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="mt-auto pt-4 flex justify-between items-end">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{post.author.name}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formattedDate}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.likes}</span>
              </div>
              
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
