import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';
import { Garage, Vehicle as VehicleType } from '../../types';

interface AddVehicleDialogProps {
  isOpen: boolean;
  selectedVehicle: VehicleType | null;
  garages: Garage[];
  purchaseStep: 'selectGarage' | 'selectPosition';
  selectedTargetGarage: Garage | null;
  onClose: () => void;
  onSelectGarage: (garage: Garage) => void;
  onBackToGarageSelection: () => void;
  onSelectPosition: (index: number) => void;
}

const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({
  isOpen,
  selectedVehicle,
  garages,
  purchaseStep,
  selectedTargetGarage,
  onClose,
  onSelectGarage,
  onBackToGarageSelection,
  onSelectPosition
}) => {
  if (!isOpen || !selectedVehicle) return null;

  return (
    <div className={styles.moveDialogOverlay}>
      <div className={styles.moveDialog}>
        <div className={styles.moveDialogHeader}>
          <h3>添加载具</h3>
        </div>
        <div className={styles.moveDialogContent}>
          {purchaseStep === 'selectGarage' && (
            <>
              <h4>选择车库</h4>
              <div className={styles.garageSelection}>
                {garages.map(garage => (
                  <div
                    key={garage.id}
                    className={styles.garageOption}
                    onClick={() => onSelectGarage(garage)}
                  >
                    <div className={styles.garageOptionName}>{garage.storageName}</div>
                    <div className={styles.garageOptionCapacity}>{garage.vehicleList.filter(vehicle => Object.keys(vehicle).length > 0).length}/{garage.num} 位置</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {purchaseStep === 'selectPosition' && selectedTargetGarage && (
            <>
              <div className={styles.dialogStepNavigation}>
                <button
                  className={styles.backButton}
                  onClick={onBackToGarageSelection}
                >
                  返回
                </button>
                <div className={styles.targetGarageInfo}>
                  当前车库：{selectedTargetGarage.storageName}
                </div>
              </div>
              <h4>选择目标位置</h4>
              <div className={styles.positionSelection}>
                {selectedTargetGarage.vehicleList.map((vehicle, index) => {
                  const isEmpty = Object.keys(vehicle).length === 0;
                  return (
                    <div
                      key={index}
                      className={`${styles.positionOption} 
                        ${isEmpty ? styles.emptyPosition : styles.occupiedPosition}`}
                      onClick={() => onSelectPosition(index)}
                    >
                      <div className={styles.positionNumber}>位置 {index + 1}</div>
                      {isEmpty ? (
                        <div className={styles.positionStatus}>空</div>
                      ) : (
                        <div className={styles.positionVehicle}>
                          {`${vehicle.vehicleName}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className={styles.moveDialogActions}>
          <button
            className={styles.confirmDialogCancel}
            onClick={onClose}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleDialog;
