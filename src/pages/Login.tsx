
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      password: '',
      general: ''
    };
    
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
      valid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate authentication (replace with actual auth logic)
    setTimeout(() => {
      // Demo credentials for testing
      if (formData.username === 'admin' && formData.password === 'password') {
        // Store auth state (this would be a token in a real app)
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/admin');
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Неверное имя пользователя или пароль'
        }));
      }
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12 mt-16 page-transition">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 shadow-lg animate-scale-in">
            <div className="text-center mb-8">
              <h1 className="heading-lg mb-2">Вход в админ-панель</h1>
              <p className="text-gray-400">
                Войдите для управления блогом
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-500 text-sm">
                  {errors.general}
                </div>
              )}
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Имя пользователя
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className={`
                      w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-lg focus:ring-2 focus:outline-none transition-colors
                      ${errors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:ring-accent/20 focus:border-accent'}
                    `}
                    placeholder="Введите имя пользователя"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`
                      w-full pl-10 pr-12 py-3 bg-secondary/50 border rounded-lg focus:ring-2 focus:outline-none transition-colors
                      ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:ring-accent/20 focus:border-accent'}
                    `}
                    placeholder="Введите пароль"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full flex items-center justify-center py-3 px-4 rounded-lg
                    bg-accent hover:bg-accent/90 text-white font-medium
                    transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Вход...
                    </div>
                  ) : 'Войти'}
                </button>
              </div>
              
              <div className="text-xs text-center text-gray-400 mt-4">
                <p>Для демонстрации используйте:</p>
                <p>Логин: <span className="text-accent">admin</span></p>
                <p>Пароль: <span className="text-accent">password</span></p>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
