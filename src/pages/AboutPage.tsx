import React from 'react';
import Header from '../components/Header';


interface AboutPageProps {
  className?: string;
}

const AboutPage: React.FC<AboutPageProps> = ({ className }) => {
  return (
    <div className={className}>
      <div>
        <Header
          title="关于"
        />
      </div>
    </div>
  )
};

export default AboutPage;