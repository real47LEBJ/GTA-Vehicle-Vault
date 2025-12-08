import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';
import { GarageVehicle, Vehicle as VehicleType } from '../../types';

interface ConfirmReplaceDialogProps {
  isOpen: boolean;
  selectedVehicle: VehicleType | null;
  targetVehicle: GarageVehicle | null;
  targetPositionIndex: number | null;
  onCancel: () => void;
  onConfirm: (targetIndex: number) => void;
}

const ConfirmReplaceDialog: React.FC<ConfirmReplaceDialogProps> = ({
  isOpen,
  selectedVehicle,
  targetVehicle,
  targetPositionIndex,
  onCancel,
  onConfirm
}) => {
  if (!isOpen || !selectedVehicle || !targetVehicle) return null;

  return (
    <div className={styles.swapDialogOverlay}>
      <div className={styles.swapDialog}>
        <div className={styles.swapDialogHeader}>
          <h3>确认覆盖</h3>
        </div>
        <div className={styles.swapDialogContent}>
          <div className={styles.swapInfo}>
            <div className={styles.swapVehicle}>
              <h5>新载具</h5>
              <p>{selectedVehicle?.vehicle_name}</p>
            </div>
            <div className={styles.swapArrow}>→</div>
            <div className={styles.swapVehicle}>
              <h5>已有载具</h5>
              <p>{`${targetVehicle.vehicleName}`}</p>
            </div>
          </div>
        </div>
        <div className={styles.swapDialogActions}>
          <button
            className={styles.confirmDialogCancel}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className={styles.confirmDialogConfirm}
            onClick={async () => {
              if (targetPositionIndex !== null) {
                onConfirm(targetPositionIndex);
              }
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmReplaceDialog;
