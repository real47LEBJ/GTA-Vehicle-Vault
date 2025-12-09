import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';

interface LoadingProps {
  loading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ loading }) => {
  if (!loading) return null;
  
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loading}>加载中...</div>
    </div>
  );
};

export default Loading;