import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';
import { Vehicle as VehicleType, Brand } from '../../types';
import VehicleItem from './VehicleItem';

interface VehicleListProps {
  vehicles: VehicleType[];
  brands: Brand[];
  featureDict: Record<string, string>;
  onAddVehicle: (vehicle: VehicleType) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  brands,
  featureDict,
  onAddVehicle,
}) => {
  return (
    <div className={styles.vehicleListContainer}>
      {/* 载具列表 */}
      <div className={styles.vehicleList}>
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <VehicleItem
              key={vehicle.id}
              vehicle={vehicle}
              brands={brands}
              onAddVehicle={onAddVehicle}
              featureDict={featureDict}
            />
          ))
        ) : (
          <div className={styles.noVehicles}>空</div>
        )}
      </div>
    </div>
  );
};

export default VehicleList;
