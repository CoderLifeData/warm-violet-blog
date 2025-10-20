import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 animate-fade-in px-4">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-gradient">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">
            Страница не найдена
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            К сожалению, страница, которую вы ищете, не существует или была перемещена.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              На главную
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
