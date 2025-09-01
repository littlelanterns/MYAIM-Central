import React from 'react';

interface FormProps {
  children: React.ReactNode;
  // TODO: Define additional props for Form
}

const Form: React.FC<FormProps> = ({ children, ...props }) => {
  return (
    <div className="form">
      {children}
    </div>
  );
};

export default Form;
