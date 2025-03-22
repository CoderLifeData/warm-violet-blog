
// IndexedDB database service for the blog application
import { Post, Author } from '../data/posts';

// Database configuration
const DB_NAME = 'blog_database';
const DB_VERSION = 1;

// Database object stores (tables)
const POSTS_STORE = 'posts';
const COMMENTS_STORE = 'comments';
const LIKES_STORE = 'likes';
const FEATURED_POSTS_STORE = 'featured_posts';

// Comment interface
export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string; // ISO string
}

// Like interface
export interface Like {
  id: string;
  postId: string;
  timestamp: string; // ISO string
}

// Featured post reference
export interface FeaturedPost {
  id: string;
  postId: string;
  order: number;
}

// Open the database connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening database');
      reject(new Error('Could not open database'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create posts store if it doesn't exist
      if (!db.objectStoreNames.contains(POSTS_STORE)) {
        const postsStore = db.createObjectStore(POSTS_STORE, { keyPath: 'id' });
        postsStore.createIndex('category', 'category', { unique: false });
        postsStore.createIndex('date', 'date', { unique: false });
      }
      
      // Create comments store if it doesn't exist
      if (!db.objectStoreNames.contains(COMMENTS_STORE)) {
        const commentsStore = db.createObjectStore(COMMENTS_STORE, { keyPath: 'id' });
        commentsStore.createIndex('postId', 'postId', { unique: false });
      }
      
      // Create likes store if it doesn't exist
      if (!db.objectStoreNames.contains(LIKES_STORE)) {
        const likesStore = db.createObjectStore(LIKES_STORE, { keyPath: 'id' });
        likesStore.createIndex('postId', 'postId', { unique: false });
      }
      
      // Create featured posts store if it doesn't exist
      if (!db.objectStoreNames.contains(FEATURED_POSTS_STORE)) {
        const featuredStore = db.createObjectStore(FEATURED_POSTS_STORE, { keyPath: 'id' });
        featuredStore.createIndex('order', 'order', { unique: false });
      }
    };
  });
};

// Initialize the database with default data
export const initializeDatabase = async (defaultPosts: Post[]): Promise<void> => {
  try {
    const db = await openDB();
    
    // Check if posts store is empty
    const tx = db.transaction(POSTS_STORE, 'readonly');
    const store = tx.objectStore(POSTS_STORE);
    const count = await new Promise<number>((resolve) => {
      const countRequest = store.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
    });
    
    // If empty, add default posts
    if (count === 0) {
      const writeTx = db.transaction(POSTS_STORE, 'readwrite');
      const writeStore = writeTx.objectStore(POSTS_STORE);
      
      defaultPosts.forEach(post => {
        writeStore.add(post);
      });
      
      await new Promise<void>((resolve, reject) => {
        writeTx.oncomplete = () => {
          console.log('Default posts added to database');
          resolve();
        };
        writeTx.onerror = () => {
          console.error('Error adding default posts');
          reject(new Error('Failed to add default posts'));
        };
      });
      
      // Add first 3 posts as featured by default
      await initializeFeaturedPosts(defaultPosts.slice(0, 3).map((post, index) => ({
        id: `featured-${index}`,
        postId: post.id,
        order: index
      })));
    }
    
    db.close();
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Initialize featured posts if needed
const initializeFeaturedPosts = async (featuredPosts: FeaturedPost[]): Promise<void> => {
  try {
    const db = await openDB();
    const tx = db.transaction(FEATURED_POSTS_STORE, 'readwrite');
    const store = tx.objectStore(FEATURED_POSTS_STORE);
    
    // Clear existing featured posts
    store.clear();
    
    // Add new featured posts
    featuredPosts.forEach(post => {
      store.add(post);
    });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to initialize featured posts'));
    });
    
    db.close();
  } catch (error) {
    console.error('Error initializing featured posts:', error);
    throw error;
  }
};

// Posts CRUD operations
export const getPosts = async (): Promise<Post[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(POSTS_STORE, 'readonly');
    const store = tx.objectStore(POSTS_STORE);
    const posts = await new Promise<Post[]>((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
    db.close();
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const db = await openDB();
    const tx = db.transaction(POSTS_STORE, 'readonly');
    const store = tx.objectStore(POSTS_STORE);
    const post = await new Promise<Post | undefined>((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
    });
    db.close();
    return post || null;
  } catch (error) {
    console.error(`Error getting post by id ${id}:`, error);
    return null;
  }
};

export const addPost = async (post: Post): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(POSTS_STORE, 'readwrite');
    const store = tx.objectStore(POSTS_STORE);
    store.add(post);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to add post'));
    });
    db.close();
    return true;
  } catch (error) {
    console.error('Error adding post:', error);
    return false;
  }
};

export const updatePost = async (post: Post): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(POSTS_STORE, 'readwrite');
    const store = tx.objectStore(POSTS_STORE);
    store.put(post);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to update post'));
    });
    db.close();
    return true;
  } catch (error) {
    console.error('Error updating post:', error);
    return false;
  }
};

export const deletePost = async (id: string): Promise<boolean> => {
  try {
    const db = await openDB();
    
    // Delete post
    const postTx = db.transaction(POSTS_STORE, 'readwrite');
    const postStore = postTx.objectStore(POSTS_STORE);
    postStore.delete(id);
    await new Promise<void>((resolve, reject) => {
      postTx.oncomplete = () => resolve();
      postTx.onerror = () => reject(new Error('Failed to delete post'));
    });
    
    // Delete associated comments
    await deleteCommentsByPostId(id);
    
    // Delete associated likes
    await deleteLikesByPostId(id);
    
    // Remove from featured if present
    await removePostFromFeatured(id);
    
    db.close();
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

// Comments CRUD operations
export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(COMMENTS_STORE, 'readonly');
    const store = tx.objectStore(COMMENTS_STORE);
    const index = store.index('postId');
    
    const comments = await new Promise<Comment[]>((resolve) => {
      const request = index.getAll(postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    // Sort comments by date (newest first)
    comments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    db.close();
    return comments;
  } catch (error) {
    console.error(`Error getting comments for post ${postId}:`, error);
    return [];
  }
};

export const addComment = async (comment: Comment): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction([COMMENTS_STORE, POSTS_STORE], 'readwrite');
    const commentsStore = tx.objectStore(COMMENTS_STORE);
    const postsStore = tx.objectStore(POSTS_STORE);
    
    // Add the comment
    commentsStore.add(comment);
    
    // Update comment count on the post
    const post = await new Promise<Post | undefined>((resolve) => {
      const request = postsStore.get(comment.postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    if (post) {
      post.comments += 1;
      postsStore.put(post);
    }
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to add comment'));
    });
    
    db.close();
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

export const updateComment = async (comment: Comment): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(COMMENTS_STORE, 'readwrite');
    const store = tx.objectStore(COMMENTS_STORE);
    store.put(comment);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to update comment'));
    });
    db.close();
    return true;
  } catch (error) {
    console.error('Error updating comment:', error);
    return false;
  }
};

export const deleteComment = async (id: string, postId: string): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction([COMMENTS_STORE, POSTS_STORE], 'readwrite');
    const commentsStore = tx.objectStore(COMMENTS_STORE);
    const postsStore = tx.objectStore(POSTS_STORE);
    
    // Delete the comment
    commentsStore.delete(id);
    
    // Update comment count on the post
    const post = await new Promise<Post | undefined>((resolve) => {
      const request = postsStore.get(postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    if (post && post.comments > 0) {
      post.comments -= 1;
      postsStore.put(post);
    }
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to delete comment'));
    });
    
    db.close();
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};

const deleteCommentsByPostId = async (postId: string): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(COMMENTS_STORE, 'readwrite');
    const store = tx.objectStore(COMMENTS_STORE);
    const index = store.index('postId');
    
    const comments = await new Promise<Comment[]>((resolve) => {
      const request = index.getAll(postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    comments.forEach(comment => {
      store.delete(comment.id);
    });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to delete comments'));
    });
    
    db.close();
    return true;
  } catch (error) {
    console.error(`Error deleting comments for post ${postId}:`, error);
    return false;
  }
};

// Likes CRUD operations
export const getLikesByPostId = async (postId: string): Promise<Like[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(LIKES_STORE, 'readonly');
    const store = tx.objectStore(LIKES_STORE);
    const index = store.index('postId');
    
    const likes = await new Promise<Like[]>((resolve) => {
      const request = index.getAll(postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    db.close();
    return likes;
  } catch (error) {
    console.error(`Error getting likes for post ${postId}:`, error);
    return [];
  }
};

export const getLikeCount = async (postId: string): Promise<number> => {
  try {
    const likes = await getLikesByPostId(postId);
    return likes.length;
  } catch (error) {
    console.error(`Error getting like count for post ${postId}:`, error);
    return 0;
  }
};

export const hasUserLiked = async (postId: string): Promise<boolean> => {
  try {
    // In a real application, we would check for the user ID
    // Here we're using localStorage to simulate user session
    const userLiked = localStorage.getItem(`user_liked_${postId}`);
    return userLiked === 'true';
  } catch (error) {
    console.error(`Error checking if user liked post ${postId}:`, error);
    return false;
  }
};

export const addLike = async (postId: string): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction([LIKES_STORE, POSTS_STORE], 'readwrite');
    const likesStore = tx.objectStore(LIKES_STORE);
    const postsStore = tx.objectStore(POSTS_STORE);
    
    // Create a new like
    const like: Like = {
      id: `like-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      postId,
      timestamp: new Date().toISOString()
    };
    
    // Add the like
    likesStore.add(like);
    
    // Update like count on the post
    const post = await new Promise<Post | undefined>((resolve) => {
      const request = postsStore.get(postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    if (post) {
      post.likes += 1;
      postsStore.put(post);
    }
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to add like'));
    });
    
    // Mark that the user has liked this post
    localStorage.setItem(`user_liked_${postId}`, 'true');
    
    db.close();
    return true;
  } catch (error) {
    console.error('Error adding like:', error);
    return false;
  }
};

export const removeLike = async (postId: string): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction([LIKES_STORE, POSTS_STORE], 'readwrite');
    const likesStore = tx.objectStore(LIKES_STORE);
    const postsStore = tx.objectStore(POSTS_STORE);
    const likesIndex = likesStore.index('postId');
    
    // Find one like to remove (in a real app we would filter by user ID)
    const likes = await new Promise<Like[]>((resolve) => {
      const request = likesIndex.getAll(postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    if (likes.length > 0) {
      // Remove one like (in a real app we would remove the specific user's like)
      likesStore.delete(likes[0].id);
      
      // Update like count on the post
      const post = await new Promise<Post | undefined>((resolve) => {
        const request = postsStore.get(postId);
        request.onsuccess = () => resolve(request.result);
      });
      
      if (post && post.likes > 0) {
        post.likes -= 1;
        postsStore.put(post);
      }
    }
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to remove like'));
    });
    
    // Mark that the user has unliked this post
    localStorage.setItem(`user_liked_${postId}`, 'false');
    
    db.close();
    return true;
  } catch (error) {
    console.error('Error removing like:', error);
    return false;
  }
};

const deleteLikesByPostId = async (postId: string): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(LIKES_STORE, 'readwrite');
    const store = tx.objectStore(LIKES_STORE);
    const index = store.index('postId');
    
    const likes = await new Promise<Like[]>((resolve) => {
      const request = index.getAll(postId);
      request.onsuccess = () => resolve(request.result);
    });
    
    likes.forEach(like => {
      store.delete(like.id);
    });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to delete likes'));
    });
    
    // Remove user like status for this post
    localStorage.removeItem(`user_liked_${postId}`);
    
    db.close();
    return true;
  } catch (error) {
    console.error(`Error deleting likes for post ${postId}:`, error);
    return false;
  }
};

// Featured posts operations
export const getFeaturedPosts = async (): Promise<Post[]> => {
  try {
    const db = await openDB();
    
    // Get featured posts references
    const featuredTx = db.transaction(FEATURED_POSTS_STORE, 'readonly');
    const featuredStore = featuredTx.objectStore(FEATURED_POSTS_STORE);
    const featuredRefs = await new Promise<FeaturedPost[]>((resolve) => {
      const request = featuredStore.getAll();
      request.onsuccess = () => resolve(request.result);
    });
    
    // Sort by order
    featuredRefs.sort((a, b) => a.order - b.order);
    
    // Get the actual posts
    const postTx = db.transaction(POSTS_STORE, 'readonly');
    const postStore = postTx.objectStore(POSTS_STORE);
    
    const featuredPosts: Post[] = [];
    
    for (const ref of featuredRefs) {
      const post = await new Promise<Post | undefined>((resolve) => {
        const request = postStore.get(ref.postId);
        request.onsuccess = () => resolve(request.result);
      });
      
      if (post) {
        featuredPosts.push(post);
      }
    }
    
    db.close();
    return featuredPosts;
  } catch (error) {
    console.error('Error getting featured posts:', error);
    return [];
  }
};

export const updateFeaturedPosts = async (postIds: string[]): Promise<boolean> => {
  try {
    const db = await openDB();
    const tx = db.transaction(FEATURED_POSTS_STORE, 'readwrite');
    const store = tx.objectStore(FEATURED_POSTS_STORE);
    
    // Clear existing featured posts
    store.clear();
    
    // Add new featured posts
    postIds.forEach((postId, index) => {
      const featuredPost: FeaturedPost = {
        id: `featured-${index}`,
        postId,
        order: index
      };
      store.add(featuredPost);
    });
    
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to update featured posts'));
    });
    
    db.close();
    return true;
  } catch (error) {
    console.error('Error updating featured posts:', error);
    return false;
  }
};

const removePostFromFeatured = async (postId: string): Promise<boolean> => {
  try {
    // Get current featured posts
    const featuredPosts = await getFeaturedPosts();
    
    // Filter out the post to remove
    const updatedFeaturedIds = featuredPosts
      .filter(post => post.id !== postId)
      .map(post => post.id);
    
    // Update featured posts
    await updateFeaturedPosts(updatedFeaturedIds);
    
    return true;
  } catch (error) {
    console.error(`Error removing post ${postId} from featured:`, error);
    return false;
  }
};

// Query operations
export const getRecentPosts = async (): Promise<Post[]> => {
  try {
    const posts = await getPosts();
    return [...posts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error getting recent posts:', error);
    return [];
  }
};

export const getRelatedPosts = async (currentPostId: string, category: string): Promise<Post[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(POSTS_STORE, 'readonly');
    const store = tx.objectStore(POSTS_STORE);
    const categoryIndex = store.index('category');
    
    const relatedPosts = await new Promise<Post[]>((resolve) => {
      const request = categoryIndex.getAll(category);
      request.onsuccess = () => {
        const filtered = request.result.filter(post => post.id !== currentPostId);
        resolve(filtered.slice(0, 2));
      };
    });
    
    db.close();
    return relatedPosts;
  } catch (error) {
    console.error(`Error getting related posts for ${currentPostId}:`, error);
    return [];
  }
};
