import React from 'react';
import '../styles/components/Header.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
  return (
    <header className="page-header">
      <div className="page-header-content">
        <h1>{title}</h1>
        {subtitle && (
          <p className="page-header-subtitle">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="header-actions">
          {children}
        </div>
      )}
    </header>
  );
};

export default Header;