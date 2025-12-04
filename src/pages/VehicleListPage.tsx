import React, { useState, useEffect } from 'react';
import styles from '../styles/pages/VehicleListPage.module.css';
import { Brand, Vehicle as VehicleType, Garage, GarageVehicle } from '../types';
import { getBrands, getVehicles, getGarages, updateGarage } from '../utils/api';

// 特性映射
const featureMap: Record<string, string> = {
  '1': '超级跑车',
  '2': '防弹',
  '3': '4WD',
  '4': '豪华轿车'
};

const VehicleListPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          if (response.data.length > 0) {
            setSelectedBrand(response.data[0].id);
          }
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

  // 获取选中品牌的车辆列表
  useEffect(() => {
    const fetchVehiclesByBrand = async () => {
      if (!selectedBrand) return;

      try {
        setLoading(true);
        setVehicles([]); // 清空之前的数据
        const response = await getVehicles(selectedBrand);
        if (response.success && response.data) {
          setVehicles(response.data || []);
        } else {
          setError(response.error || '获取车辆列表失败');
        }
      } catch (err) {
        setError('获取车辆数据时发生错误');
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

  // 过滤品牌列表（支持中英文搜索）
  const filteredBrands = brands.filter(brand =>
    brand.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.brand_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 过滤车辆列表（支持中英文搜索）
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_name.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
    vehicle.vehicle_name_en.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
  );

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
      // 直接购买车辆
      handlePurchaseVehicle(targetIndex);
    } else {
      // 确认是否覆盖已有车辆
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

      // 更新目标车库的车辆列表
      const updatedVehicleList = [...updatedGarages[targetGarageIndex].vehicleList];

      // 将选中的车辆转换为GarageVehicle格式
      const garageVehicle: GarageVehicle = {
        id: selectedVehicle.id,
        vehicleName: selectedVehicle.vehicle_name,
        vehicleNameEn: selectedVehicle.vehicle_name_en,
        feature: selectedVehicle.feature,
        // 由于VehicleType中没有brandName和brandNameEn，我们将它们设置为空字符串
        brandName: '',
        brandNameEn: '',
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
      setError('购买车辆时发生错误');
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
        {filteredBrands.map((brand) => {
          // 构建图标路径，使用厂商的英文名称作为文件名
          const logoPath = `/logos/${brand.brand_en}.webp`;
          
          return (
            <div
              className={`${styles.brandItem} ${selectedBrand === brand.id ? styles.active : ''}`}
              key={brand.id}
              onClick={() => setSelectedBrand(brand.id)}
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
                <div className={styles.brandNameEn}>{brand.brand_en}</div>
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
        ) : currentBrand ? (
          <div className={styles.brandVehicleSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>
                {currentBrand.brand} <span style={{ fontSize: '16px', color: '#757575', fontWeight: 'normal', fontStyle: 'italic' }}>{currentBrand.brand_en}</span>
              </h2>
              <div className={styles.searchInputWrapper} style={{ width: '250px' }}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="搜索载具"
                  value={vehicleSearchTerm}
                  onChange={(e) => setVehicleSearchTerm(e.target.value)}
                />
                {vehicleSearchTerm && (
                  <button
                    className={styles.clearSearchButton}
                    onClick={() => setVehicleSearchTerm('')}
                    title="清空搜索"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className={styles.vehicleList}>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => {
                  return (
                    <div className={styles.vehicleItem} key={vehicle.id}>
                      <button
                        className={styles.moveVehicleButton}
                        onClick={() => handleOpenPurchaseDialog(vehicle)}
                        title="购买车辆"
                      >
                        🛒
                      </button>
                      <div className={styles.vehicleInfo}>
                        <div className={styles.vehicleName}>{vehicle.vehicle_name}</div>
                        <div className={styles.vehicleNameEn}>{vehicle.vehicle_name_en}</div>
                        <div className={styles.vehicleFeature}>
                          {vehicle.feature.split(',').map((featureId, index) => {
                            const getFeatureInfo = (featureNum: string) => {
                              switch (featureNum) {
                                case '1':
                                  return { text: 'BENNY', class: styles.bennyFeature };
                                case '2':
                                  return { text: 'IMANI', class: styles.imaniFeature };
                                case '3':
                                  return { text: 'HAO', class: styles.haoFeature };
                                case '4':
                                  return { text: 'POLICE', class: styles.policeFeature };
                                default:
                                  return { text: featureMap[featureId] || featureId, class: styles.featureItem };
                              }
                            };
                            const featureInfo = getFeatureInfo(featureId);
                            return (
                              <div className={[styles.featureItem, featureInfo.class].join(' ')} key={index}>
                                {featureInfo.text}
                              </div>
                            );
                          })}
                        </div>
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

      {/* 购买车辆对话框 */}
      {showPurchaseDialog && (
        <div className={styles.moveDialogOverlay}>
          <div className={styles.moveDialog}>
            <div className={styles.moveDialogHeader}>
              <h3>购买车辆</h3>
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

      {/* 覆盖车辆确认对话框 */}
      {showReplaceConfirm && targetVehicle && (
        <div className={styles.swapDialogOverlay}>
          <div className={styles.swapDialog}>
            <div className={styles.swapDialogHeader}>
              <h3>确认覆盖</h3>
            </div>
            <div className={styles.swapDialogContent}>
              <p>该位置已有车辆，确定要覆盖吗？</p>
              <div className={styles.swapInfo}>
                <div className={styles.swapVehicle}>
                  <h5>新车辆：</h5>
                  <p>{selectedVehicle?.vehicle_name}</p>
                </div>
                <div className={styles.swapArrow}>→</div>
                <div className={styles.swapVehicle}>
                  <h5>已有车辆：</h5>
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

export default VehicleListPage;