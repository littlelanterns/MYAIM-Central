import React from 'react';

const Button = ({ children }) => {
  return (
    <button>
      {children || 'Button'}
    </button>
  );
};

export default Button;