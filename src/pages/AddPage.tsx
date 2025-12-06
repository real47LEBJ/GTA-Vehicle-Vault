import React, { useState, useEffect } from 'react';
import styles from '../styles/pages/AddPage.module.css';
import { Brand, Vehicle as VehicleType, Garage, GarageVehicle } from '../types';
import { getBrands, getVehicles, getGarages, updateGarage, getFeatureTypeDicts, getVehicleTypeDicts, getAllVehicles } from '../utils/api';

// 特性配置数组 - 存储每个特性的文本、背景颜色和字体颜色
const featureConfig = [
  { text: 'BENNY', bgColor: '#CC5555', textColor: '#FFFFFF' },
  { text: 'IMANI', bgColor: '#3D9992', textColor: '#FFFFFF' },
  { text: 'HAO', bgColor: '#3499B2', textColor: '#FFFFFF' },
  { text: 'POLICE', bgColor: '#229954', textColor: '#FFFFFF' },
  { text: 'ARENA', bgColor: '#7D4693', textColor: '#FFFFFF' },
  { text: 'PEGASUS', bgColor: '#D35400', textColor: '#FFFFFF' },
  { text: 'DRIFT', bgColor: '#C0392B', textColor: '#FFFFFF' },
  { text: 'WAREHOUSE', bgColor: '#3f6d99ff', textColor: '#FFFFFF' },
  { text: 'NIGHTCLUB', bgColor: '#703688', textColor: '#FFFFFF' },
  { text: 'BUNKER', bgColor: '#6C7A7D', textColor: '#FFFFFF' },
  { text: 'ARMORED', bgColor: '#A93226', textColor: '#FFFFFF' },
  { text: 'FACILITIE', bgColor: '#138D75', textColor: '#FFFFFF' },
  { text: 'TERRORBYTE', bgColor: '#229954', textColor: '#FFFFFF' },
  { text: 'HANGAR', bgColor: '#6d2299ff', textColor: '#FFFFFF' },
  { text: 'CHOP SHOP', bgColor: '#228799ff', textColor: '#FFFFFF' },
  { text: 'DUMB', bgColor: '#999722ff', textColor: '#FFFFFF' },
  { text: 'KOSATKA', bgColor: '#99227fff', textColor: '#FFFFFF' },
];

// 创建特性映射以快速查找配置
const featureConfigMap = Object.fromEntries(
  featureConfig.map(feature => [feature.text, feature])
);

const AddPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  // 选择的品牌ID，默认值为'all'表示显示全部载具
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 特性字典状态
  const [featureDict, setFeatureDict] = useState<Record<string, string>>({});
  // 载具类型字典状态
  const [vehicleTypeDict, setVehicleTypeDict] = useState<Record<string, string>>({});
  // 筛选条件状态
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [showUnavailableVehicles, setShowUnavailableVehicles] = useState<boolean>(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(56); // 每页56个项目

  // 购买功能相关状态
  const [showPurchaseDialog, setShowPurchaseDialog] = useState<boolean>(false);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedTargetGarage, setSelectedTargetGarage] = useState<Garage | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'selectGarage' | 'selectPosition'>('selectGarage');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState<boolean>(false);
  const [targetPositionIndex, setTargetPositionIndex] = useState<number | null>(null);
  const [targetVehicle, setTargetVehicle] = useState<GarageVehicle | null>(null);

  // 获取品牌列表
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await getBrands();
        if (response.success && response.data) {
          setBrands(response.data);
          // 不要自动设置第一个品牌为选中状态，保持默认值'all'
        } else {
          setError(response.error || '获取品牌列表失败');
        }
      } catch (err) {
        setError('获取数据时发生错误');
        console.error('Error fetching brands:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // 获取选中品牌的载具列表或全部载具
  useEffect(() => {
    const fetchVehiclesByBrand = async () => {
      try {
        setLoading(true);
        setVehicles([]); // 清空之前的数据
        let response;

        if (selectedBrand === 'all') {
          // 获取全部载具
          response = await getAllVehicles();
          if (response.success && response.data) {
            // 从[Brand, Vehicle]元组中提取Vehicle部分
            const allVehicles = response.data.map(([_, vehicle]) => vehicle);
            setVehicles(allVehicles);
          } else {
            setError(response.error || '获取全部载具列表失败');
          }
        } else {
          // 获取选中品牌的载具
          response = await getVehicles(selectedBrand);
          if (response.success && response.data) {
            setVehicles(response.data || []);
          } else {
            setError(response.error || '获取载具列表失败');
          }
        }
      } catch (err) {
        setError('获取载具数据时发生错误');
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclesByBrand();
  }, [selectedBrand]);

  // 获取车库列表
  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const response = await getGarages();
        if (response.success && response.data) {
          setGarages(response.data || []);
        } else {
          console.error('获取车库列表失败:', response.error);
        }
      } catch (err) {
        console.error('获取车库数据时发生错误:', err);
      }
    };

    fetchGarages();
  }, []);

  // 获取特性类型字典
  useEffect(() => {
    const fetchFeatureTypeDicts = async () => {
      try {
        const response = await getFeatureTypeDicts();
        if (response.success && response.data) {
          setFeatureDict(response.data || {});
        } else {
          console.error('获取特性类型字典失败:', response.error);
        }
      } catch (err) {
        console.error('获取特性类型字典时发生错误:', err);
      }
    };

    fetchFeatureTypeDicts();
  }, []);

  // 获取载具类型字典
  useEffect(() => {
    const fetchVehicleTypeDicts = async () => {
      try {
        const response = await getVehicleTypeDicts();
        if (response.success && response.data) {
          setVehicleTypeDict(response.data || {});
        } else {
          console.error('获取载具类型字典失败:', response.error);
        }
      } catch (err) {
        console.error('获取载具类型字典时发生错误:', err);
      }
    };

    fetchVehicleTypeDicts();
  }, []);

  // 过滤品牌列表（支持中英文搜索）
  const filteredBrands = brands.filter(brand =>
    brand.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.brand_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 过滤载具列表（支持多种筛选条件）
  const filteredVehicles = React.useMemo(() => {
    let result = vehicles.filter(vehicle =>
      vehicle.vehicle_name.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
      vehicle.vehicle_name_en.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
    );

    // 过滤载具类型
    if (selectedVehicleType) {
      result = result.filter(vehicle => vehicle.vehicle_type === selectedVehicleType);
    }

    // 过滤特性
    if (selectedFeature) {
      result = result.filter(vehicle =>
        vehicle.feature && vehicle.feature.includes(selectedFeature)
      );
    }

    // 过滤不可获取载具
    if (!showUnavailableVehicles) {
      result = result.filter(vehicle => vehicle.price !== -1);
    }

    // 价格排序
    if (priceSort) {
      result = [...result].sort((a, b) => {
        if (priceSort === 'asc') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }

    return result;
  }, [vehicles, vehicleSearchTerm, selectedVehicleType, selectedFeature, showUnavailableVehicles, priceSort]);

  // 分页计算
  const paginatedVehicles = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVehicles.slice(startIndex, endIndex);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  // 总页数
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // 获取当前选中的品牌信息
  const currentBrand = brands.find(brand => brand.id === selectedBrand) || null;

  // 购买功能相关函数
  const handleOpenPurchaseDialog = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setPurchaseStep('selectGarage');
    setShowPurchaseDialog(true);
  };

  const handleClosePurchaseDialog = () => {
    setShowPurchaseDialog(false);
    setSelectedVehicle(null);
    setSelectedTargetGarage(null);
    setPurchaseStep('selectGarage');
    setShowReplaceConfirm(false);
    setTargetPositionIndex(null);
    setTargetVehicle(null);
  };

  const handleSelectTargetGarage = (garage: Garage) => {
    setSelectedTargetGarage(garage);
    setPurchaseStep('selectPosition');
  };

  const handleBackToGarageSelection = () => {
    setPurchaseStep('selectGarage');
    setSelectedTargetGarage(null);
  };

  const handleSelectTargetPosition = (targetIndex: number) => {
    if (!selectedTargetGarage) return;

    const targetVehicleData = selectedTargetGarage.vehicleList[targetIndex];
    const isTargetEmpty = Object.keys(targetVehicleData).length === 0;

    if (isTargetEmpty) {
      // 直接购买载具
      handlePurchaseVehicle(targetIndex);
    } else {
      // 确认是否覆盖已有载具
      setTargetPositionIndex(targetIndex);
      setTargetVehicle(targetVehicleData);
      setShowReplaceConfirm(true);
    }
  };

  const handlePurchaseVehicle = async (targetIndex: number) => {
    if (!selectedVehicle || !selectedTargetGarage) return;

    try {
      // 复制当前车库状态
      const updatedGarages = [...garages];

      // 找到目标车库
      const targetGarageIndex = updatedGarages.findIndex(g => g.id === selectedTargetGarage.id);

      if (targetGarageIndex === -1) return;

      // 更新目标车库的载具列表
      const updatedVehicleList = [...updatedGarages[targetGarageIndex].vehicleList];

      // 找到载具对应的品牌信息
      const brand = brands.find(b => b.id === selectedVehicle.brand_id);
      const brandName = brand ? brand.brand : '';
      const brandNameEn = brand ? brand.brand_en : '';

      // 将选中的载具转换为GarageVehicle格式
      const garageVehicle: GarageVehicle = {
        id: selectedVehicle.id,
        vehicleName: selectedVehicle.vehicle_name,
        vehicleNameEn: selectedVehicle.vehicle_name_en,
        feature: selectedVehicle.feature,
        brandName: brandName,
        brandNameEn: brandNameEn,
        price: selectedVehicle.price,
        vehicle_type: selectedVehicle.vehicle_type,
        remarks: ''
      };

      // 更新目标位置
      updatedVehicleList[targetIndex] = garageVehicle;

      // 更新车库信息
      updatedGarages[targetGarageIndex] = {
        ...updatedGarages[targetGarageIndex],
        vehicleList: updatedVehicleList
      };

      // 更新本地状态
      setGarages(updatedGarages);

      // 发送API请求保存到后端
      await updateGarage(updatedGarages[targetGarageIndex]);

      // 关闭对话框
      handleClosePurchaseDialog();
    } catch (err) {
      setError('购买载具时发生错误');
      console.error(err);
    }
  };


  if (loading && brands.length === 0) {
    return <div className={styles.loadingContainer}>加载中...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>错误: {error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.brandContainer}>
        <div className={styles.filterContainer}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索品牌"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className={styles.clearSearchButton}
                onClick={() => setSearchTerm('')}
                title="清空搜索"
              >
                ×
              </button>
            )}
          </div>
        </div>
        {/* 添加"全部"选项 */}
        <div
          className={`${styles.brandItem} ${selectedBrand === 'all' ? styles.active : ''}`}
          key="all"
          onClick={() => {
            setSelectedBrand('all');
            setCurrentPage(1); // 切换品牌时重置到第一页
          }}
        >
          <div className={styles.brandInfo}>
            <div className={styles.brandName}>全部</div>
            {/* <div className={styles.brandNameEn}>All</div> */}
          </div>
        </div>
        {filteredBrands.map((brand) => {
          // 构建图标路径，使用厂商的英文名称作为文件名
          const logoPath = `/logos/${brand.brand_en}.webp`;

          return (
            <div
              className={`${styles.brandItem} ${selectedBrand === brand.id ? styles.active : ''}`}
              key={brand.id}
              onClick={() => {
                setSelectedBrand(brand.id);
                setCurrentPage(1); // 切换品牌时重置到第一页
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
                {/* <div className={styles.brandNameEn}>{brand.brand_en}</div> */}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.vehicleContainer}>
        {loading && vehicles.length === 0 ? (
          <div className={styles.loadingContainer}>加载中...</div>
        ) : error ? (
          <div className={styles.errorContainer}>错误: {error}</div>
        ) : (currentBrand || selectedBrand === 'all') ? (
          <div className={styles.brandVehicleSection}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '16px', marginLeft: '26px' }}>
              <div className={styles.searchInputWrapper} style={{ width: '250px' }}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="搜索载具"
                  value={vehicleSearchTerm}
                  onChange={(e) => {
                    setVehicleSearchTerm(e.target.value);
                    setCurrentPage(1); // 搜索时重置到第一页
                  }}
                />
                {vehicleSearchTerm && (
                  <button
                    className={styles.clearSearchButton}
                    onClick={() => {
                      setVehicleSearchTerm('');
                      setCurrentPage(1); // 清空搜索时重置到第一页
                    }}
                    title="清空搜索"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* 数量展示 */}
              <div style={{ fontSize: '18px', color: '#ffffff', marginLeft: '26px' }}>
                {vehicles.length}
              </div>

              {/* 分页组件 */}
              {(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '27px', marginRight: '26px' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
              )}

              {/* 价格排序 */}
              <select
                className={styles.filterSelect}
                value={priceSort || ''}
                onChange={(e) => {
                  setPriceSort(e.target.value as 'asc' | 'desc' | null);
                  setCurrentPage(1); // 筛选变化时重置到第一页
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
                    setSelectedVehicleType(e.target.value || null);
                    setCurrentPage(1); // 筛选变化时重置到第一页
                  }}
                >
                  <option value="" disabled style={{ display: 'none' }}>请选择载具类型</option>
                  {Object.entries(vehicleTypeDict).map(([typeEn, typeZh]) => (
                    <option key={typeEn} value={typeEn}>{typeEn}</option>
                  ))}
                </select>
                {selectedVehicleType && (
                  <button
                    className={styles.clearSelectButton}
                    onClick={() => setSelectedVehicleType(null)}
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
                    setSelectedFeature(e.target.value || null);
                    setCurrentPage(1); // 筛选变化时重置到第一页
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
                    onClick={() => setSelectedFeature(null)}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* 显示/隐藏不可获取载具 */}
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="showUnavailable"
                  checked={showUnavailableVehicles}
                  onChange={(e) => {
                    setShowUnavailableVehicles(e.target.checked);
                    setCurrentPage(1); // 筛选变化时重置到第一页
                  }}
                  className={styles.customCheckbox}
                />
                <label htmlFor="showUnavailable">显示不可获取的载具</label>
              </div>

              {/* 重置按钮 */}
              <button
                className={styles.resetButton}
                onClick={() => {
                  setVehicleSearchTerm('');
                  setSelectedVehicleType(null);
                  setSelectedFeature(null);
                  setPriceSort(null);
                  setShowUnavailableVehicles(false);
                }}
              >
                重置筛选
              </button>
            </div>
            <div className={styles.vehicleList}>
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((vehicle) => {
                  // 格式化价格，添加美元符号和逗号，当价格为0时显示'免费获取'
                  const formatPrice = (price: number) => {
                    if (price === 0) {
                      return '免费获取';
                    }
                    return `$${price.toLocaleString('en-US')}`;
                  };

                  return (
                    <div className={styles.vehicleItem} key={vehicle.id}>
                      <button
                        className={styles.moveVehicleButton}
                        onClick={() => handleOpenPurchaseDialog(vehicle)}
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
                })
              ) : (
                <div className={styles.noVehicles}>空</div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.noBrandSelected}>请选择一个品牌</div>
        )}
      </div>

      {/* 购买载具对话框 */}
      {showPurchaseDialog && (
        <div className={styles.moveDialogOverlay}>
          <div className={styles.moveDialog}>
            <div className={styles.moveDialogHeader}>
              <h3>购买载具</h3>
              <button className={styles.closeButton} onClick={handleClosePurchaseDialog}>
                ×
              </button>
            </div>
            <div className={styles.moveDialogContent}>
              {purchaseStep === 'selectGarage' && (
                <>
                  <h4>选择目标车库</h4>
                  <div className={styles.garageSelection}>
                    {garages.map(garage => (
                      <div
                        key={garage.id}
                        className={styles.garageOption}
                        onClick={() => handleSelectTargetGarage(garage)}
                      >
                        <div className={styles.garageOptionName}>{garage.storageName}</div>
                        <div className={styles.garageOptionCapacity}>{garage.vehicleList.filter(vehicle => Object.keys(vehicle).length > 0).length}/{garage.num} 位置</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {purchaseStep === 'selectPosition' && selectedTargetGarage && (
                <>
                  <div className={styles.dialogStepNavigation}>
                    <button
                      className={styles.backButton}
                      onClick={handleBackToGarageSelection}
                    >
                      ←返回选择车库
                    </button>
                    <div className={styles.targetGarageInfo}>
                      目标车库：{selectedTargetGarage.storageName}
                    </div>
                  </div>
                  <h4>选择目标位置</h4>
                  <div className={styles.positionSelection}>
                    {selectedTargetGarage.vehicleList.map((vehicle, index) => {
                      const isEmpty = Object.keys(vehicle).length === 0;
                      return (
                        <div
                          key={index}
                          className={`${styles.positionOption} 
                            ${isEmpty ? styles.emptyPosition : styles.occupiedPosition}`}
                          onClick={() => handleSelectTargetPosition(index)}
                        >
                          <div className={styles.positionNumber}>位置 {index + 1}</div>
                          {isEmpty ? (
                            <div className={styles.positionStatus}>空</div>
                          ) : (
                            <div className={styles.positionVehicle}>
                              {`${vehicle.vehicleName}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className={styles.moveDialogActions}>
              {purchaseStep === 'selectGarage' && (
                <button
                  className={styles.confirmDialogCancel}
                  onClick={handleClosePurchaseDialog}
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 覆盖载具确认对话框 */}
      {showReplaceConfirm && targetVehicle && (
        <div className={styles.swapDialogOverlay}>
          <div className={styles.swapDialog}>
            <div className={styles.swapDialogHeader}>
              <h3>确认覆盖</h3>
            </div>
            <div className={styles.swapDialogContent}>
              <p>该位置已有载具，确定要覆盖吗？</p>
              <div className={styles.swapInfo}>
                <div className={styles.swapVehicle}>
                  <h5>新载具：</h5>
                  <p>{selectedVehicle?.vehicle_name}</p>
                </div>
                <div className={styles.swapArrow}>→</div>
                <div className={styles.swapVehicle}>
                  <h5>已有载具：</h5>
                  <p>{`${targetVehicle.vehicleName}`}</p>
                </div>
              </div>
            </div>
            <div className={styles.swapDialogActions}>
              <button
                className={styles.confirmDialogCancel}
                onClick={() => setShowReplaceConfirm(false)}
              >
                取消
              </button>
              <button
                className={styles.confirmDialogConfirm}
                onClick={async () => {
                  if (targetPositionIndex !== null) {
                    await handlePurchaseVehicle(targetPositionIndex);
                  }
                  setShowReplaceConfirm(false);
                }}
              >
                确认覆盖
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default AddPage;