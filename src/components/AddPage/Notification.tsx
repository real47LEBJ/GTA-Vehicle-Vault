import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';

interface NotificationProps {
  isVisible: boolean;
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ isVisible, message }) => {
  if (!isVisible) return null;

  return (
    <div className={`${styles.notification} ${isVisible ? styles.notificationVisible : ''}`}>
      {message}
    </div>
  );
};

export default Notification;
