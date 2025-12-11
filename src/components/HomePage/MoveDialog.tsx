import React, { useMemo } from 'react';
import styles from '../../styles/pages/HomePage.module.css';
import { Garage, GarageVehicle } from '../../types';

interface MoveDialogProps {
  showMoveDialog: boolean;
  moveStep: 1 | 2;
  selectedVehicleToMove: { garageId: number; vehicleIndex: number; vehicleData: GarageVehicle } | null;
  targetGarageId: number;
  targetVehicleIndex: number;
  garages: Garage[];
  handleCancelMove: () => void;
  handleSelectTargetGarage: (garageId: number) => void;
  handleSelectTargetPosition: (index: number) => void;
  handleMoveVehicle?: () => void;
  handleBackToSelectGarage: () => void;
}

const MoveDialog: React.FC<MoveDialogProps> = ({
  showMoveDialog,
  moveStep,
  selectedVehicleToMove,
  targetGarageId,
  garages,
  handleCancelMove,
  handleSelectTargetGarage,
  handleSelectTargetPosition,
  handleBackToSelectGarage
}) => {
  if (!showMoveDialog || !selectedVehicleToMove) return null;

  // 使用useMemo缓存查找结果，减少每次渲染时的重复查找
  const sourceGarage = useMemo(() => {
    return garages.find(g => g.id === selectedVehicleToMove.garageId);
  }, [garages, selectedVehicleToMove.garageId]);

  const targetGarage = useMemo(() => {
    return garages.find(g => g.id === targetGarageId);
  }, [garages, targetGarageId]);

  // 缓存目标车库的位置列表渲染结果
  const targetGaragePositions = useMemo(() => {
    if (!targetGarage) return null;
    
    return targetGarage.vehicleList.map((vehicle: GarageVehicle, index: number) => {
      // 检查是否是正在移动的载具的原始位置
      const isMovingVehicle =
        selectedVehicleToMove.garageId === targetGarageId &&
        selectedVehicleToMove.vehicleIndex === index;

      // 检查是否为空车位
      const isEmpty = !vehicle || Object.keys(vehicle).length === 0;

      // 根据状态确定样式类
      let positionClass = styles.positionItem;
      if (isMovingVehicle) {
        positionClass += ` ${styles.currentVehiclePosition}`;
      } else if (isEmpty) {
        positionClass += ` ${styles.emptyPosition}`;
      } else {
        positionClass += ` ${styles.occupiedPosition}`;
      }

      return (
        <div
          key={index}
          className={positionClass}
          onClick={isMovingVehicle ? undefined : () => handleSelectTargetPosition(index)}
        >
          <div className={styles.positionIndex}>{index + 1}</div>
          <div className={styles.positionVehicle}>
            {isEmpty ? (
              <div className={styles.emptyPosition}></div>
            ) : (
              <>
                <div>{vehicle.brandName} {vehicle.vehicleName}</div>
                {isMovingVehicle && (
                  <div className={styles.movingVehicleLabel}>
                    正在移动的载具
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
  }, [targetGarage, targetGarageId, selectedVehicleToMove.garageId, selectedVehicleToMove.vehicleIndex, handleSelectTargetPosition]);

  return (
    <div className={styles.moveDialogOverlay}>
      <div className={styles.moveDialog}>
        <div className={styles.moveDialogHeader}>
          <h3>{moveStep === 1 ? '选择目标车库' : '选择目标位置'}</h3>
        </div>
        <div className={styles.moveDialogContent}>
          {moveStep === 2 && (
            <button
              className={styles.confirmDialogBack}
              onClick={handleBackToSelectGarage}
            >
              返回
            </button>
          )}
          {moveStep === 1 ? (
            <>
              <p>从 <span style={{ fontSize: '22px' }}>{sourceGarage?.storageName || '未知车库'}</span> 移动 <span style={{ fontSize: '22px', color: '#ffffff' }}>{selectedVehicleToMove.vehicleData.brandName} {selectedVehicleToMove.vehicleData.vehicleName}</span></p>
              <p>选择目标车库:</p>
              <div className={styles.garageList}>
                {garages.map((garage) => (
                  <div
                    key={garage.id}
                    className={styles.garageItem}
                    onClick={() => handleSelectTargetGarage(garage.id)}
                  >
                    <div className={styles.garageName}>{garage.storageName}</div>
                    <div className={styles.garageCapacity}>{garage.vehicleList.filter(v => Object.keys(v).length > 0).length} / {garage.num}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p>从 <span style={{ fontSize: '22px' }}>{sourceGarage?.storageName || '未知车库'}</span> 移动 <span style={{ fontSize: '22px', color: '#ffffff' }}>{selectedVehicleToMove.vehicleData.brandName} {selectedVehicleToMove.vehicleData.vehicleName}</span></p>
              <p>到 <span style={{ fontSize: '22px' }}>{targetGarage?.storageName || '未知车库'}</span></p>
              <p>选择目标位置:</p>
              <div className={styles.positionList}>
                {targetGaragePositions}
              </div>
            </>
          )}
        </div>
        <div className={styles.moveDialogActions}>
          <button
            className={styles.confirmDialogCancel}
            onClick={handleCancelMove}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MoveDialog);