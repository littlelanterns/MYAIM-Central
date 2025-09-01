import React from 'react';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className, disabled }) => {
  return (
    <button 
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {children || 'Button'}
    </button>
  );
};

export default Button;