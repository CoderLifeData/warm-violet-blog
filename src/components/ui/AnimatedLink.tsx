
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AnimatedLinkProps {
  to: string;
  children: ReactNode;
  isActive?: boolean;
  className?: string;
}

export const AnimatedLink = ({ 
  to, 
  children, 
  isActive = false, 
  className = ''
}: AnimatedLinkProps) => {
  return (
    <Link
      to={to}
      className={`
        relative inline-block transition-colors duration-300
        ${isActive ? 'text-accent' : 'text-white hover:text-gray-300'}
        ${className}
      `}
    >
      {children}
      <span 
        className={`
          absolute bottom-0 left-0 w-full h-0.5 bg-accent transform origin-left
          transition-transform duration-300 ease-out
          ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
        `}
      />
    </Link>
  );
};
