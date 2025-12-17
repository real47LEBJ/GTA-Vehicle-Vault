import React, { useState } from 'react';
import styles from '../../styles/pages/HomePage.module.css';
import { GarageVehicle } from '../../types';
import { featureConfigMap } from '../../utils/features';

// 格式化价格函数
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '未知';
  if (price === 0) return '免费获取';
  if (price === -1) return '无法获取';
  return '$' + new Intl.NumberFormat('zh-CN').format(price);
};

interface VehicleItemProps {
  vehicle: GarageVehicle;
  index: number;
  garageId: number;
  featureDict: Record<string, string>;
  handleOpenMoveDialog: (
    garageId: number,
    vehicleIndex: number,
    vehicleData: GarageVehicle
  ) => void;
  handleOpenDeleteConfirmDialog: (
    garageId: number,
    vehicleIndex: number,
    vehicleData: GarageVehicle
  ) => void;
}

const VehicleItem: React.FC<VehicleItemProps> = ({
  vehicle,
  index,
  garageId,
  featureDict,
  handleOpenMoveDialog,
  handleOpenDeleteConfirmDialog,
}) => {
  const [imageError, setImageError] = useState(false);

  // 检查载具是否为空对象
  const isEmptyVehicle = Object.keys(vehicle).length === 0;

  // 构建图片路径
  const imagePath = !isEmptyVehicle ? `/vehicle_thumbnails/${vehicle.vehicleNameEn}.webp` : '';
  // const imagePath = !isEmptyVehicle ? `/vehicle_thumbnails/S95.webp` : '';

  return (
    <div className={styles.vehicleItem} key={index}>
      {!isEmptyVehicle && (
        <div className={styles.vehicleButtons}>
          <button
            className={styles.moveVehicleButton}
            onClick={() => handleOpenMoveDialog(garageId, index, vehicle)}
          >
            <img src="/move.png" style={{ display: 'block', cursor: 'pointer' }} />
          </button>
          <button
            className={styles.deleteVehicleButton}
            onClick={() => handleOpenDeleteConfirmDialog(garageId, index, vehicle)}
          >
            <img src="/delete.png" style={{ display: 'block', cursor: 'pointer' }} />
          </button>
        </div>
      )}

      <div className={styles.vehicleInfo}>
        {isEmptyVehicle ? (
          // 空载具显示"空"
          <div className={styles.emptyVehicleText}></div>
        ) : (
          // 有内容的载具显示详细信息
          <>
            <div className={styles.vehicleBrand}>{vehicle.brandName}</div>
            <div className={styles.vehicleName}>{vehicle.vehicleName}</div>
            <div className={styles.vehicleType}>{vehicle.vehicle_type}</div>
            <div className={styles.vehiclePrice}>{formatPrice(vehicle.price)}</div>

            {/* 载具图片展示 */}
            {!isEmptyVehicle && (
              <div className={styles.vehicleImageContainer}>
                {!imageError ? (
                  <img
                    src={imagePath}
                    alt={vehicle.vehicleName}
                    className={styles.vehicleImage}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className={styles.vehicleImagePlaceholder}>
                    <span>{vehicle.vehicleNameEn.slice(0, 2)}</span>
                  </div>
                )}
              </div>
            )}
            {/* 只有当feature不为null且不为空时才显示特性列表 */}
            {vehicle.feature && vehicle.feature.trim() !== '' && (
              <div className={styles.vehicleFeature}>
                {vehicle.feature.split(',').map((featureText, index) => {
                  // 移除可能的空格
                  const cleanFeatureText = featureText.trim();
                  // 如果清理后的文本为空，跳过渲染
                  if (!cleanFeatureText) return null;

                  // 获取特性配置
                  const featureInfo = featureConfigMap[cleanFeatureText];

                  // 如果找到配置，使用配置的样式；否则使用默认样式
                  const style = featureInfo
                    ? {
                        backgroundColor: featureInfo.bgColor,
                        color: featureInfo.textColor,
                      }
                    : {};

                  // 获取中文特性名称
                  const translatedFeature = featureDict[cleanFeatureText] || cleanFeatureText;

                  return (
                    <div className={styles.featureItem} style={style} key={index}>
                      {translatedFeature}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleItem;
