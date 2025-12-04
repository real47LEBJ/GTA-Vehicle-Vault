import React from 'react';
import '../styles/components/Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  ...props
}) => {
  const combinedClasses = `btn btn-${variant} btn-${size} ${className}`;

  return (
      <button className={combinedClasses} {...props}>
        {children}
      </button>
    );
};

export default Button;