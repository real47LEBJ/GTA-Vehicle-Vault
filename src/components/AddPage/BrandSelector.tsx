import React from 'react';
import styles from '../../styles/pages/AddPage.module.css';
import { Brand } from '../../types';

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrand: string;
  searchTerm: string;
  onBrandSelect: (brandId: string) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({
  brands,
  selectedBrand,
  searchTerm,
  onBrandSelect,
  onSearchChange,
  onPageChange,
}) => {
  // 过滤品牌列表（支持中英文搜索）
  const filteredBrands = brands.filter(
    (brand) =>
      brand.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.brand_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.brandContainer}>
      <div className={styles.filterContainer}>
        <div className={styles.searchInputWrapper}>
          <input
            style={{ width: '15vw' }}
            type="text"
            className={styles.searchInput}
            placeholder="搜索品牌"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className={styles.clearSearchButton} onClick={() => onSearchChange('')}>
              ×
            </button>
          )}
        </div>
      </div>
      {/* 添加"全部"选项 */}
      <button
        className={`${styles.brandItem} ${selectedBrand === 'all' ? styles.active : ''}`}
        key="all"
        onClick={() => {
          onPageChange(1); // 先重置页码
          onBrandSelect('all');
        }}
      >
        <div className={styles.brandInfo}>
          <div className={styles.brandName}>全部</div>
        </div>
      </button>
      {filteredBrands.map((brand) => {
        // 构建图标路径，使用厂商的英文名称作为文件名
        const logoPath = `/logos/${brand.brand_en}.webp`;

        return (
          <button
            className={`${styles.brandItem} ${selectedBrand === brand.id ? styles.active : ''}`}
            key={brand.id}
            onClick={() => {
              onPageChange(1); // 先重置页码
              onBrandSelect(brand.id);
            }}
          >
            <img
              src={logoPath}
              alt={brand.brand}
              className={styles.brandLogo}
              onError={(e) => {
                // 如果图片加载失败，隐藏图片
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className={styles.brandInfo}>
              <div className={styles.brandName}>{brand.brand}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default BrandSelector;
