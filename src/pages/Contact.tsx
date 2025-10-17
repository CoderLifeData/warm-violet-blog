import { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ContactForm } from '../components/ui/ContactForm';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { getContacts, Contact as ContactType } from '../lib/db';

const Contact = () => {
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await getContacts();
        setContacts(data);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContacts();
  }, []);
  
  const getContactIcon = (type: ContactType['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-6 w-6 text-accent" />;
      case 'phone':
        return <Phone className="h-6 w-6 text-accent" />;
      default:
        return <MessageCircle className="h-6 w-6 text-accent" />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow mt-24 page-transition">
        <section className="py-12 md:py-16">
          <div className="layout-container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-xl mb-4">Связаться со мной</h1>
              <p className="text-xl text-gray-300 mb-8">
                Есть вопросы или предложения? Напишите мне!
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-12">
          <div className="layout-container">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <div className="glass-card rounded-2xl p-6 md:p-8 animate-slide-in-left">
                  <h2 className="heading-md mb-6">Контактная информация</h2>
                  
                  {isLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-6 bg-white/10 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {contacts.length === 0 ? (
                        <p className="text-gray-400">Контакты не добавлены. Добавьте их в админ-панели.</p>
                      ) : (
                        contacts.map((contact) => (
                          <div key={contact.id} className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              {getContactIcon(contact.type)}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-semibold mb-1">{contact.name}</h3>
                              <a 
                                href={contact.type === 'email' ? `mailto:${contact.value}` : contact.type === 'phone' ? `tel:${contact.value}` : contact.value}
                                className="text-gray-300 hover:text-accent transition-colors"
                                target={contact.type === 'email' || contact.type === 'phone' ? undefined : '_blank'}
                                rel={contact.type === 'email' || contact.type === 'phone' ? undefined : 'noopener noreferrer'}
                              >
                                {contact.value}
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <div className="glass-card rounded-2xl p-6 md:p-8 animate-slide-in-right">
                  <h2 className="heading-md mb-6">Отправить сообщение</h2>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
