import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';
import { Vehicle as VehicleType, Brand } from '../../types';
import { featureConfigMap } from '../../utils/features';

interface VehicleItemProps {
  vehicle: VehicleType;
  brands: Brand[];
  onAddVehicle: (vehicle: VehicleType) => void;
  featureDict: Record<string, string>;
}

const VehicleItem: React.FC<VehicleItemProps> = ({ vehicle, brands, onAddVehicle, featureDict }) => {
  // 格式化价格
  const formatPrice = (price: number) => {
    if (price === 0) {
      return '免费获取';
    }
    if (price === -1) {
      return '无法获取';
    }
    return `$${price.toLocaleString('en-US')}`;
  };

  return (
    <div className={styles.vehicleItem} key={vehicle.id}>
      <button
        className={styles.moveVehicleButton}
        onClick={() => onAddVehicle(vehicle)}
      >
        <img src="/add.png" style={{ width: '20px', height: '20px' }} />
      </button>
      <div className={styles.vehicleInfo}>
        {/* 查找载具对应的品牌信息 */}
        {(() => {
          const brand = brands.find(b => b.id === vehicle.brand_id);
          return (
            <div className={styles.vehicleBrand}>{brand ? brand.brand : '未知品牌'}</div>
          );
        })()}
        <div className={styles.vehicleName}>{vehicle.vehicle_name}</div>
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
              // 获取中文翻译
              const featureChinese = featureDict[cleanFeatureText] || cleanFeatureText;

              // 如果找到配置，使用配置的颜色；否则使用默认样式
              const style = featureInfo ? {
                backgroundColor: featureInfo.bgColor,
                color: featureInfo.textColor
              } : {};

              return (
                <div
                  className={styles.featureItem}
                  style={style}
                  key={index}
                >
                  {featureChinese}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleItem;
