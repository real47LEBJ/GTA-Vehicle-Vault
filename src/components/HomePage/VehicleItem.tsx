import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';
import { GarageVehicle } from '../../types';

// 格式化价格函数
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '未知';
  if (price === 0) return '免费获取';
  if (price === -1) return '无法获取';
  return '$' + new Intl.NumberFormat('zh-CN').format(price);
};

// 特性配置数组 - 存储每个特性的文本、背景颜色和字体颜色
const featureConfig = [
  { text: 'BENNY', bgColor: '#CC5555', textColor: '#FFFFFF' },
  { text: 'IMANI', bgColor: '#3D9992', textColor: '#FFFFFF' },
  { text: 'HAO', bgColor: '#3499B2', textColor: '#FFFFFF' },
  { text: 'POLICE', bgColor: '#229954', textColor: '#FFFFFF' },
  { text: 'ARENA', bgColor: '#7D4693', textColor: '#FFFFFF' },
  { text: 'PEGASUS', bgColor: '#D35400', textColor: '#FFFFFF' },
  { text: 'DRIFT', bgColor: '#C0392B', textColor: '#FFFFFF' },
  { text: 'WEAPONIZED', bgColor: '#3f6d99ff', textColor: '#FFFFFF' },
  { text: 'NIGHTCLUB', bgColor: '#703688', textColor: '#FFFFFF' },
  { text: 'BUNKER', bgColor: '#6C7A7D', textColor: '#FFFFFF' },
  { text: 'WAREHOUSE', bgColor: '#A93226', textColor: '#FFFFFF' },
  { text: 'FACILITY', bgColor: '#138D75', textColor: '#FFFFFF' },
  { text: 'HANGAR', bgColor: '#6d2299ff', textColor: '#FFFFFF' },
  { text: 'SALVAGE YARDS', bgColor: '#228799ff', textColor: '#FFFFFF' },
  { text: 'FREAKSHOP', bgColor: '#999722ff', textColor: '#FFFFFF' },
  { text: 'KOSATKA', bgColor: '#99227fff', textColor: '#FFFFFF' },
  { text: 'ELECTRIC', bgColor: '#91a82cff', textColor: '#FFFFFF' },
  { text: 'ARMED', bgColor: '#99227fff', textColor: '#FFFFFF' },
  { text: 'ARMORED', bgColor: '#91a82cff', textColor: '#FFFFFF' },
];

// 创建特性映射以快速查找配置
const featureConfigMap = Object.fromEntries(
  featureConfig.map((feature) => [feature.text, feature])
);

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
  // 检查载具是否为空对象
  const isEmptyVehicle = Object.keys(vehicle).length === 0;

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
