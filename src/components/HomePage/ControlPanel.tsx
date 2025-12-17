import React from 'react';
import styles from '../../styles/pages/HomePage.module.css';
import { Garage } from '../../types';

interface ControlPanelProps {
  garageName: string;
  setGarageName: (name: string) => void;
  garageCapacity: string;
  setGarageCapacity: (capacity: string) => void;
  garageRemarks: string;
  setGarageRemarks: (remarks: string) => void;
  handleCapacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddGarage: () => void;
  handleSelectAll: () => void;
  handleOpenConfirmDialog: () => void;
  handleUpdateVehicleFeatures: () => void;
  loading: boolean;
  garages: Garage[];
  selectedGarageIds: number[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  garageName,
  setGarageName,
  garageCapacity,
  garageRemarks,
  setGarageRemarks,
  handleCapacityChange,
  handleAddGarage,
  handleSelectAll,
  handleOpenConfirmDialog,
  handleUpdateVehicleFeatures,
  loading,
  garages,
  selectedGarageIds,
}) => {
  return (
    <div className={styles.controlContainer}>
      <div className={styles.controlItem}>
        <div className={styles.controlInput}>
          <input
            type="text"
            placeholder="请输入车库名称"
            value={garageName}
            onChange={(e) => setGarageName(e.target.value)}
            className={styles.garageNameInput}
          />
        </div>
      </div>
      <div className={styles.controlItem}>
        <div className={styles.controlInput}>
          <input
            type="text"
            placeholder="请输入车库容量"
            value={garageCapacity}
            onChange={handleCapacityChange}
            className={styles.garageCapacityInput}
          />
        </div>
      </div>
      <div className={styles.controlItem}>
        <div className={styles.controlInput}>
          <input
            type="text"
            placeholder="请输入车库备注（可选）"
            value={garageRemarks}
            onChange={(e) => setGarageRemarks(e.target.value)}
            className={styles.garageRemarksInput}
          />
        </div>
      </div>
      <div className={styles.controlItem}>
        <div className={styles.controlButton}>
          <button onClick={handleAddGarage} disabled={loading}>
            {loading ? '添加中...' : '新增'}
          </button>
        </div>
        <div className={styles.controlButton}>
          <button onClick={handleSelectAll} disabled={loading || garages.length === 0}>
            {selectedGarageIds.length === garages.length ? '取消全选' : '全选'}
          </button>
        </div>
        <div className={styles.controlButton}>
          <button
            onClick={handleOpenConfirmDialog}
            disabled={selectedGarageIds.length === 0}
            className={selectedGarageIds.length === 0 ? '' : styles.deleteButton}
          >
            删除 ({selectedGarageIds.length})
          </button>
        </div>
        <div className={styles.controlButton}>
          <button onClick={handleUpdateVehicleFeatures} disabled={loading}>
            {loading ? '更新中...' : '更新数据'}
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 6px',
            width: '50px',
          }}
        >
          <div style={{ fontSize: '11px' }}>车库总计</div>
          <div>{garages.length}</div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 6px',
            width: '50px',
          }}
        >
          <div style={{ fontSize: '11px' }}>载具总计</div>
          <div>
            {garages.reduce((total, garage) => {
              const nonEmptyVehicles =
                garage.vehicleList?.filter((vehicle) => Object.keys(vehicle).length > 0) || [];
              return total + nonEmptyVehicles.length;
            }, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
