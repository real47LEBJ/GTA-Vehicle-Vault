import React from 'react';
import '../styles/components/Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="input-container">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className={`input-field ${error ? "error" : ""} ${className}`} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;