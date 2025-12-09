import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';

interface VehicleFilterProps {
  vehicleSearchTerm: string;
  priceSort: 'asc' | 'desc' | null;
  selectedVehicleType: string | null;
  selectedFeature: string | null;
  showUnavailableVehicles: boolean;
  vehicleTypeDict: Record<string, string>;
  featureDict: Record<string, string>;
  totalVehicles: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onVehicleSearchChange: (term: string) => void;
  onPriceSortChange: (sort: 'asc' | 'desc' | null) => void;
  onVehicleTypeChange: (type: string | null) => void;
  onFeatureChange: (feature: string | null) => void;
  onShowUnavailableChange: (show: boolean) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
}

const VehicleFilter: React.FC<VehicleFilterProps> = ({
  vehicleSearchTerm,
  priceSort,
  selectedVehicleType,
  selectedFeature,
  showUnavailableVehicles,
  vehicleTypeDict,
  featureDict,
  totalVehicles,
  currentPage,
  totalPages,
  onVehicleSearchChange,
  onPriceSortChange,
  onVehicleTypeChange,
  onFeatureChange,
  onShowUnavailableChange,
  onResetFilters,
  onPageChange
}) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '16px', marginLeft: '26px' }}>
      {/* 数量展示 */}
      <div style={{ fontSize: '18px', color: '#ffffff' }}>
        {totalVehicles}
      </div>

      {/* 分页组件 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <img src="/previous.png" style={{ width: '20px', height: '20px' }} />
        </button>
        <span style={{ fontSize: '20px', color: '#ffffff', paddingBottom: '3px' }}>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <img src="/next.png" style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
      <div className={styles.searchInputWrapper} style={{ width: '250px' }}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索载具"
          value={vehicleSearchTerm}
          onChange={(e) => {
            onPageChange(1); // 先重置页码
            onVehicleSearchChange(e.target.value);
          }}
        />
        {vehicleSearchTerm && (
          <button
            className={styles.clearSearchButton}
            onClick={() => {
              onPageChange(1); // 先重置页码
              onVehicleSearchChange('');
            }}
            title="清空搜索"
          >
            ×
          </button>
        )}
      </div>

      {/* 价格排序 */}
      <select
        className={styles.filterSelect}
        value={priceSort || ''}
        onChange={(e) => {
          onPageChange(1); // 先重置页码
          onPriceSortChange(e.target.value as 'asc' | 'desc' | null);
        }}
      >
        <option value="">价格排序</option>
        <option value="asc">价格升序</option>
        <option value="desc">价格降序</option>
      </select>

      {/* 载具类型筛选 */}
      <div className={styles.selectContainer}>
        <select
          className={`${styles.filterSelect} ${!selectedVehicleType ? styles.selectPlaceholder : ''}`}
          value={selectedVehicleType || ''}
          onChange={(e) => {
            onPageChange(1); // 先重置页码
            onVehicleTypeChange(e.target.value || null);
          }}
        >
          <option value="" disabled style={{ display: 'none' }}>请选择载具类型</option>
          {Object.entries(vehicleTypeDict).map(([typeEn]) => (
            <option key={typeEn} value={typeEn}>{typeEn}</option>
          ))}
        </select>
        {selectedVehicleType && (
          <button
            className={styles.clearSelectButton}
            onClick={() => {
              onPageChange(1); // 先重置页码
              onVehicleTypeChange(null);
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* 特性筛选 */}
      <div className={styles.selectContainer}>
        <select
          className={`${styles.filterSelect} ${!selectedFeature ? styles.selectPlaceholder : ''}`}
          value={selectedFeature || ''}
          onChange={(e) => {
            onPageChange(1); // 先重置页码
            onFeatureChange(e.target.value || null);
          }}
        >
          <option value="" disabled style={{ display: 'none' }}>请选择特性</option>
          {Object.entries(featureDict).map(([featureEn, featureZh]) => (
            <option key={featureEn} value={featureEn}>{featureZh}</option>
          ))}
        </select>
        {selectedFeature && (
          <button
            className={styles.clearSelectButton}
            onClick={() => {
              onPageChange(1); // 先重置页码
              onFeatureChange(null);
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* 显示/隐藏不可获取载具 */}
      <div className={styles.checkboxContainer}>
        <label htmlFor="showUnavailable" className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            id="showUnavailable"
            checked={showUnavailableVehicles}
            onChange={(e) => {
              onPageChange(1); // 先重置页码
              onShowUnavailableChange(e.target.checked);
            }}
            className={styles.customCheckbox}
          />
          <span className={styles.checkboxStyle}></span>
          <span className={styles.checkboxLabelText}>显示无法获取的载具</span>
        </label>
      </div>

      {/* 重置按钮 */}
      <button
        className={styles.resetButton}
        onClick={onResetFilters}
      >
        重置筛选
      </button>
    </div>
  );
};

export default VehicleFilter;
