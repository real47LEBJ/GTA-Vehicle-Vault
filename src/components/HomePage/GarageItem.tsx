import React, { RefObject } from 'react';
import styles from '../../styles/pages/HomePage.module.css';
import { Garage, GarageVehicle } from '../../types';
import VehicleItem from './VehicleItem';

interface GarageItemProps {
  garage: Garage;
  isSelected: boolean;
  editingRemarksId: number | null;
  editRemarks: string;
  isUnsaved: boolean;
  editInputRef: RefObject<HTMLInputElement>;
  featureDict: Record<string, string>;
  handleSelectGarage: (id: number) => void;
  handleOpenEditRemarks: (garage: Garage) => void;
  handleSaveRemarks: (garageId: number) => void;
  handleCancelEditRemarks: () => void;
  handleChangeRemarks: (value: string) => void;
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

const GarageItem: React.FC<GarageItemProps> = ({
  garage,
  isSelected,
  editingRemarksId,
  editRemarks,
  isUnsaved,
  editInputRef,
  featureDict,
  handleSelectGarage,
  handleOpenEditRemarks,
  handleSaveRemarks,
  handleCancelEditRemarks,
  handleChangeRemarks,
  handleOpenMoveDialog,
  handleOpenDeleteConfirmDialog,
}) => {
  return (
    <div
      className={`${styles.storageItem} ${isSelected ? styles.selectedStorageItem : ''}`}
      key={garage.id}
    >
      <div className={styles.storageItemHeader}>
        <div
          className={styles.checkboxContainer}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectGarage(garage.id);
          }}
        >
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectGarage(garage.id);
            }}
          />
          <label className={styles.checkboxLabel}></label>
        </div>
        <div className={styles.storageInfo}>
          <div className={styles.storageDetails}>
            <div className={styles.storageName}>{garage.storageName}</div>
          </div>
          <div className={styles.remarksContainer}>
            {editingRemarksId === garage.id ? (
              <div className={styles.editRemarksContainer}>
                <input
                  ref={editInputRef}
                  type="text"
                  className={`${styles.editRemarksInput} ${isUnsaved ? styles.unsavedInput : ''}`}
                  value={editRemarks}
                  onChange={(e) => {
                    handleChangeRemarks(e.target.value);
                  }}
                  onBlur={() => {
                    handleSaveRemarks(garage.id);
                  }}
                  onFocus={() => {
                    // 聚焦时不做特殊处理
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveRemarks(garage.id);
                    } else if (e.key === 'Escape') {
                      handleCancelEditRemarks();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            ) : (
              <div className={styles.storageRemarks} onClick={(e) => e.stopPropagation()}>
                {garage.remarks || '暂无备注'}
              </div>
            )}
            <button
              className={styles.editRemarksButton}
              onClick={(e) => {
                e.stopPropagation();
                if (editingRemarksId === garage.id) {
                  handleSaveRemarks(garage.id);
                } else {
                  handleOpenEditRemarks(garage);
                }
              }}
            >
              <img
                src={editingRemarksId === garage.id ? '/save.png' : '/edit.png'}
                alt={editingRemarksId === garage.id ? '保存' : '编辑'}
                style={{ width: '25px', height: '25px', display: 'block', cursor: 'pointer' }}
              />
            </button>
          </div>
          <div className={styles.storageNumContainer}>
            <div className={styles.storageNum}>
              {garage.vehicleList.filter((vehicle) => Object.keys(vehicle).length > 0).length}/
              {garage.num}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.vehicleList}>
        {garage.vehicleList.map((vehicle: GarageVehicle, index: number) => (
          <VehicleItem
            key={index}
            vehicle={vehicle}
            index={index}
            garageId={garage.id}
            featureDict={featureDict}
            handleOpenMoveDialog={handleOpenMoveDialog}
            handleOpenDeleteConfirmDialog={handleOpenDeleteConfirmDialog}
          />
        ))}
      </div>
    </div>
  );
};

export default GarageItem;
