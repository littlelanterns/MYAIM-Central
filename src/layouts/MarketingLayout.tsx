import React from 'react';
import { Outlet } from 'react-router-dom';
import MarketingNav from '../marketing/components/MarketingNav';
import MarketingFooter from '../marketing/components/MarketingFooter';

const MarketingLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--background-color)',
      width: '100%'
    }}>
      <MarketingNav />

      <main style={{
        flex: 1,
        width: '100%'
      }}>
        <Outlet />
      </main>

      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
