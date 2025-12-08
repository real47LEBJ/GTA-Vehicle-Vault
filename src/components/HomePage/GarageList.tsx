import React from 'react';
import { Garage, GarageVehicle } from '../../types';
import styles from '../../styles/pages/HomePage.module.css';

// 定义GarageList组件的属性接口
interface GarageListProps {
  garages: Garage[]; // 车库列表
  selectedGarageIds: number[]; // 选中的车库ID列表
  onGarageSelect: (id: number) => void; // 选择车库的回调
  onEditRemarks: (garageId: number) => void; // 编辑备注的回调
  onVehicleMove: (garageId: number, vehicleIndex: number, vehicleData: GarageVehicle) => void; // 移动车辆的回调
}

// GarageList组件实现
const GarageList: React.FC<GarageListProps> = ({
  garages,
  selectedGarageIds,
  onEditRemarks,
  onVehicleMove
}) => {
  // 如果没有车库，显示提示信息
  if (garages.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyText}>空</div>
      </div>
    );
  }

  return (
    <div>
      {/* 车库列表 */}
      {garages.map((garage) => {
        const isSelected = selectedGarageIds.includes(garage.id);
        return (
          <div
            className={`${styles.storageItem} ${isSelected ? styles.selectedStorageItem : ''}`}
            key={garage.id}
          >
            <h3 className={styles.storageTitle}>{garage.storageName}</h3>
            <div className={styles.storageContent}>
              {/* 车库载具列表 */}
              <div className={styles.vehicleGrid}>
                {garage.vehicleList.map((vehicle, index) => (
                  <div
                    key={index}
                    className={styles.vehicleItem}
                  >
                    {Object.keys(vehicle).length > 0 ? (
                      <div className={styles.vehicleContent}>
                        <div className={styles.vehicleName}>{vehicle.vehicleName}</div>
                        <div className={styles.vehicleBrand}>{vehicle.brandName}</div>
                        <div className={styles.vehicleFeature}>{vehicle.feature}</div>
                        <div className={styles.vehicleActions}>
                          <button
                            className={styles.vehicleActionButton}
                            onClick={() => onVehicleMove(garage.id, index, vehicle)}
                          >
                            移动
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.emptyVehicleItem}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* 车库备注 */}
            <div className={styles.storageRemarks}>
              {garage.remarks ? (
                <div onClick={() => onEditRemarks(garage.id)}>{garage.remarks}</div>
              ) : (
                <div className={styles.addRemarks} onClick={() => onEditRemarks(garage.id)}>
                  添加备注
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GarageList;