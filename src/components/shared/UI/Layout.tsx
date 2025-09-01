import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  // TODO: Define additional props for Layout
}

const Layout: React.FC<LayoutProps> = ({ children, ...props }) => {
  return (
    <div className="layout">
      {children}
    </div>
  );
};

export default Layout;
