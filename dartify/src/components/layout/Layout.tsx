import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-3">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Dartify - Camera-based Dart Scoring System</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;