import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';

interface NotificationProps {
  isVisible: boolean;
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ isVisible, message }) => {
  // 始终渲染组件，通过CSS类控制显示/隐藏和动画
  return (
    <div className={`${styles.notification} ${isVisible ? styles.notificationVisible : ''}`}>
      {message}
    </div>
  );
};

export default Notification;
