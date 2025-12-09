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
  selectedGarageIds
}) => {
  return (
    <div className={styles.controlContainer}>
      <div className={styles.controlItem}>
        <div className={styles.controlLabel}>车库名称</div>
        <div className={styles.controlInput}>
          <input
            type="text"
            placeholder="请输入车库名称"
            value={garageName}
            onChange={(e) => setGarageName(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.controlItem}>
        <div className={styles.controlLabel}>车库容量</div>
        <div className={styles.controlInput}>
          <input
            type="text"
            placeholder="请输入车库容量"
            value={garageCapacity}
            onChange={handleCapacityChange}
          />
        </div>
      </div>
      <div className={styles.controlItem}>
        <div className={styles.controlLabel}>车库备注</div>
        <div className={styles.controlInput}>
          <input
            type="text"
            placeholder="请输入车库备注（可选）"
            value={garageRemarks}
            onChange={(e) => setGarageRemarks(e.target.value)}
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
      </div>
    </div>
  );
};

export default ControlPanel;