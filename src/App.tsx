
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Updates from './pages/Updates';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { initializeDatabase } from './lib/db';
import { posts } from './data/posts';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize database with initial posts data
    const setupDB = async () => {
      try {
        await initializeDatabase(posts);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    
    setupDB();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<PostDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" closeButton richColors />
    </Router>
  );
}

export default App;
