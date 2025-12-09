import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';

interface NotificationProps {
  showNotification: boolean;
  notificationMessage: string;
}

const Notification: React.FC<NotificationProps> = ({ showNotification, notificationMessage }) => {
  return (
    <div className={`${styles.notification} ${showNotification ? styles.notificationVisible : ''}`}>
      {notificationMessage}
    </div>
  );
};

export default Notification;