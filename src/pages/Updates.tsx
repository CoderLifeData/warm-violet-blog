
import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { getUpdates, Update } from '../lib/db';

const Updates = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load updates from database
    const loadUpdates = async () => {
      setIsLoading(true);
      try {
        const data = await getUpdates();
        
        // If no updates in DB, add default ones
        if (data.length === 0) {
          const { addUpdate } = await import('../lib/db');
          const defaultUpdates = [
            {
              id: 'update-1',
              title: 'Запуск блога',
              description: 'Официальный запуск блога с первыми статьями о веб-разработке и дизайне.',
              date: '2023-10-20',
              type: 'feature' as const
            },
            {
              id: 'update-2',
              title: 'Добавлена функция комментариев',
              description: 'Теперь вы можете оставлять комментарии к статьям и участвовать в обсуждениях.',
              date: '2023-10-25',
              type: 'feature' as const
            },
            {
              id: 'update-3',
              title: 'Улучшение дизайна',
              description: 'Обновлен дизайн блога для лучшего пользовательского опыта и читаемости.',
              date: '2023-11-05',
              type: 'improvement' as const
            }
          ];
          
          for (const update of defaultUpdates) {
            await addUpdate(update);
          }
          
          setUpdates(defaultUpdates);
        } else {
          setUpdates(data);
        }
      } catch (error) {
        console.error('Error loading updates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUpdates();
  }, []);
  
  const getUpdateTypeStyles = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return 'bg-accent/20 text-accent';
      case 'improvement':
        return 'bg-blue-900/20 text-blue-400';
      case 'fix':
        return 'bg-amber-900/20 text-amber-400';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };
  
  const getUpdateTypeLabel = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return 'Новая функция';
      case 'improvement':
        return 'Улучшение';
      case 'fix':
        return 'Исправление';
      default:
        return type;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-24 page-transition">
        {/* Header */}
        <section className="py-12 md:py-16">
          <div className="layout-container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-xl mb-4">Обновления сайта</h1>
              <p className="text-xl text-gray-300 mb-8">
                Следите за новыми функциями, улучшениями и исправлениями
              </p>
            </div>
          </div>
        </section>
        
        {/* Timeline */}
        <section className="py-12">
          <div className="layout-container">
            <div className="max-w-3xl mx-auto">
              {isLoading ? (
                <div className="space-y-8">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="glass-card rounded-2xl p-6 animate-pulse-slow">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="h-6 w-24 bg-gray-800/50 rounded-full"></div>
                        <div className="h-6 w-32 bg-gray-800/50 rounded-full ml-auto"></div>
                      </div>
                      <div className="h-8 bg-gray-800/50 rounded mb-3"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-2 w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute top-0 bottom-0 left-16 w-0.5 bg-white/10 hidden sm:block"></div>
                  
                  <div className="space-y-8">
                    {updates.map((update, index) => (
                      <div 
                        key={update.id} 
                        className="glass-card rounded-2xl p-6 relative animate-slide-in-left"
                        style={{ animationDelay: `${0.1 * index}s` }}
                      >
                        {/* Timeline dot */}
                        <div className="absolute top-1/2 left-16 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent hidden sm:block"></div>
                        
                        <div className="sm:ml-16">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${getUpdateTypeStyles(update.type)}`}>
                              {getUpdateTypeLabel(update.type)}
                            </span>
                            <span className="text-sm text-gray-400 ml-auto">
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Updates;
