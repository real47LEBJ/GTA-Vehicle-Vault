import React, { useMemo } from 'react';
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
  onSelectPosition,
}) => {
  if (!isOpen || !selectedVehicle) return null;

  // 使用useMemo缓存车库容量计算结果，减少每次渲染时的重复计算
  const garagesWithCapacity = useMemo(() => {
    return garages.map((garage) => {
      const usedCapacity = garage.vehicleList.filter(
        (vehicle) => Object.keys(vehicle).length > 0
      ).length;
      return {
        ...garage,
        usedCapacity,
      };
    });
  }, [garages]);

  // 缓存目标车库的位置列表渲染结果
  const targetGaragePositions = useMemo(() => {
    if (!selectedTargetGarage) return null;

    return selectedTargetGarage.vehicleList.map((vehicle, index) => {
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
            <div className={styles.positionVehicle}>{`${vehicle.vehicle_name}`}</div>
          )}
        </div>
      );
    });
  }, [selectedTargetGarage, onSelectPosition]);

  return (
    <div className={styles.moveDialogOverlay}>
      <div className={styles.moveDialog}>
        <div className={styles.moveDialogHeader}>
          <h3>添加载具：{selectedVehicle.vehicle_name}</h3>
        </div>
        <div className={styles.moveDialogContent}>
          {purchaseStep === 'selectGarage' && (
            <>
              <h4>选择车库</h4>
              <div className={styles.garageSelection}>
                {garagesWithCapacity.map((garage) => (
                  <div
                    key={garage.id}
                    className={styles.garageOption}
                    onClick={() => onSelectGarage(garage)}
                  >
                    <div className={styles.garageOptionName}>{garage.storageName}</div>
                    <div className={styles.garageOptionCapacity}>
                      {garage.usedCapacity}/{garage.num} 位置
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {purchaseStep === 'selectPosition' && selectedTargetGarage && (
            <>
              <div className={styles.dialogStepNavigation}>
                <button className={styles.backButton} onClick={onBackToGarageSelection}>
                  返回
                </button>
                <div className={styles.targetGarageInfo}>
                  当前车库：{selectedTargetGarage.storageName}
                </div>
              </div>
              <h4>选择目标位置</h4>
              <div className={styles.positionSelection}>{targetGaragePositions}</div>
            </>
          )}
        </div>
        <div className={styles.moveDialogActions}>
          <button className={styles.confirmDialogCancel} onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AddVehicleDialog);
