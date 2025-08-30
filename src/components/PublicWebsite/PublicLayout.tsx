import React from 'react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import ChatWidget from '../Chat/ChatWidget';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <PublicFooter />
      <ChatWidget />
    </div>
  );
};

export default PublicLayout;
