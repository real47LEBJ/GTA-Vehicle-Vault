import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';
import { Garage, GarageVehicle } from '../../types';

interface SwapConfirmDialogProps {
  showSwapConfirmDialog: boolean;
  swapSource: { garageId: number; vehicleIndex: number; vehicleData: GarageVehicle } | null;
  swapTarget: { garageId: number; vehicleIndex: number; vehicleData: GarageVehicle } | null;
  garages: Garage[];
  handleCancelSwap: () => void;
  handleSwapVehicles: () => void;
}

const SwapConfirmDialog: React.FC<SwapConfirmDialogProps> = ({
  showSwapConfirmDialog,
  swapSource,
  swapTarget,
  garages,
  handleCancelSwap,
  handleSwapVehicles
}) => {
  if (!showSwapConfirmDialog || !swapSource || !swapTarget) return null;

  return (
    <div className={styles.confirmDialogOverlay}>
      <div className={styles.confirmDialog}>
        <div className={styles.confirmDialogHeader}>
          <h3>确认交换</h3>
        </div>
        <div className={styles.confirmDialogContent}>
          <div className={styles.swapDetails}>
            <div className={styles.swapItem}>
              <p>从 <span style={{ fontSize: '22px' }}>{garages.find(g => g.id === swapSource.garageId)?.storageName || '未知车库'}</span> 位置 {swapSource.vehicleIndex + 1}</p>
              <p className={styles.swapVehicleName} style={{ color: '#ffffff', fontSize: '22px' }}>{swapSource.vehicleData.brandName} {swapSource.vehicleData.vehicleName}</p>
            </div>
            <div className={styles.swapArrow}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="12 5 12 19"></polyline>
                <polyline points="5 12 12 19 19 12"></polyline>
              </svg>
            </div>
            <div className={styles.swapItem}>
              <p>到 <span style={{ fontSize: '22px' }}>{garages.find(g => g.id === swapTarget.garageId)?.storageName || '未知车库'}</span> 位置 {swapTarget.vehicleIndex + 1}</p>
              <p className={styles.swapVehicleName} style={{ color: '#ffffff', fontSize: '22px' }}>{swapTarget.vehicleData.brandName} {swapTarget.vehicleData.vehicleName}</p>
            </div>
          </div>
        </div>
        <div className={styles.confirmDialogActions}>
          <button
            className={styles.confirmDialogCancel}
            onClick={handleCancelSwap}
          >
            取消
          </button>
          <button
            className={styles.confirmDialogConfirm}
            onClick={handleSwapVehicles}
          >
            交换
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapConfirmDialog;