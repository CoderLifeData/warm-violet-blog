
import { useState } from 'react';
import { Send } from 'lucide-react';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      message: ''
    };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
      valid = false;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Сообщение обязательно';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }, 1500);
  };
  
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in">
      {submitStatus === 'success' ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-4">
            <Send size={24} />
          </div>
          <h3 className="heading-sm mb-2">Сообщение отправлено!</h3>
          <p className="text-gray-400">
            Спасибо за ваше сообщение. Я отвечу вам в ближайшее время.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Имя
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 bg-secondary/50 border rounded-lg focus:ring-2 focus:outline-none transition-colors
                ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:ring-accent/20 focus:border-accent'}
              `}
              placeholder="Ваше имя"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 bg-secondary/50 border rounded-lg focus:ring-2 focus:outline-none transition-colors
                ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:ring-accent/20 focus:border-accent'}
              `}
              placeholder="ваш@email.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Сообщение
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`
                w-full px-4 py-3 bg-secondary/50 border rounded-lg focus:ring-2 focus:outline-none transition-colors
                ${errors.message ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:ring-accent/20 focus:border-accent'}
              `}
              placeholder="Ваше сообщение..."
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full flex items-center justify-center py-3 px-4 rounded-lg
                bg-accent hover:bg-accent/90 text-white font-medium
                transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Отправка...
                </div>
              ) : (
                <>
                  Отправить сообщение
                  <Send size={18} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
