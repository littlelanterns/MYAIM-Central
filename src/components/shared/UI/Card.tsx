import React from 'react';

interface CardProps {
  children: React.ReactNode;
  // TODO: Define additional props for Card
}

const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <div className="card">
      {children}
    </div>
  );
};

export default Card;
