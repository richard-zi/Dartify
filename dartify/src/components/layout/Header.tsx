import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <svg 
              className="h-8 w-8 mr-2" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
            </svg>
            <h1 className="text-xl font-bold">Dartify</h1>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/')}`}
            >
              Home
            </Link>
            <Link 
              to="/setup" 
              className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/setup')}`}
            >
              Player Setup
            </Link>
            <Link 
              to="/game" 
              className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/game')}`}
            >
              Game
            </Link>
          </nav>
          
          <div className="md:hidden">
            <button className="focus:outline-none">
              <svg 
                className="h-6 w-6" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;