import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';
import { Garage, GarageVehicle } from '../../types';

interface VehicleDeleteConfirmDialogProps {
  showDeleteConfirmDialog: boolean;
  selectedVehicleToDelete: {
    garageId: number;
    vehicleIndex: number;
    vehicleData: GarageVehicle;
  } | null;
  garages: Garage[];
  handleCancelDeleteVehicle: () => void;
  handleConfirmDeleteVehicle: () => void;
}

const VehicleDeleteConfirmDialog: React.FC<VehicleDeleteConfirmDialogProps> = ({
  showDeleteConfirmDialog,
  selectedVehicleToDelete,
  garages,
  handleCancelDeleteVehicle,
  handleConfirmDeleteVehicle,
}) => {
  if (!showDeleteConfirmDialog || !selectedVehicleToDelete) return null;

  return (
    <div className={styles.confirmDialogOverlay}>
      <div className={styles.confirmDialog}>
        <div className={styles.confirmDialogHeader}>
          <h3>确认删除</h3>
        </div>
        <div className={styles.confirmDialogContent}>
          <p>
            确定从{' '}
            <span style={{ fontSize: '22px' }}>
              {garages.find((g) => g.id === selectedVehicleToDelete.garageId)?.storageName ||
                '未知车库'}
            </span>{' '}
            删除{' '}
            <span style={{ fontSize: '22px', color: '#ffffff' }}>
              {selectedVehicleToDelete.vehicleData.brandName}{' '}
              {selectedVehicleToDelete.vehicleData.vehicleName}
            </span>
          </p>
        </div>
        <div className={styles.confirmDialogActions}>
          <button className={styles.confirmDialogCancel} onClick={handleCancelDeleteVehicle}>
            取消
          </button>
          <button className={styles.confirmDialogConfirm} onClick={handleConfirmDeleteVehicle}>
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDeleteConfirmDialog;
