import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';

interface ConfirmDialogProps {
  showConfirmDialog: boolean;
  selectedGarageIds: number[];
  handleCancelDelete: () => void;
  handleConfirmDelete: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  showConfirmDialog,
  selectedGarageIds,
  handleCancelDelete,
  handleConfirmDelete
}) => {
  if (!showConfirmDialog) return null;

  return (
    <div className={styles.confirmDialogOverlay}>
      <div className={styles.confirmDialog}>
        <div className={styles.confirmDialogHeader}>
          <h3>确认</h3>
        </div>
        <div className={styles.confirmDialogContent}>
          <p>确定删除选中的 {selectedGarageIds.length} 个车库？</p>
        </div>
        <div className={styles.confirmDialogActions}>
          <button
            className={styles.confirmDialogCancel}
            onClick={handleCancelDelete}
          >
            取消
          </button>
          <button
            className={styles.confirmDialogConfirm}
            onClick={handleConfirmDelete}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;