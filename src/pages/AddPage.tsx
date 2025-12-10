import React, { useState, useEffect, useContext } from 'react';
import { RefreshContext } from '../App';
import styles from '../styles/pages/AddPage.module.css';
import { getBrands, getVehicles, getGarages, updateGarage, getAllVehicles, getFeatureTypeDicts, getVehicleTypeDicts } from '../utils/api';
import { Brand, Garage, GarageVehicle, Vehicle as VehicleType } from '../types';
import BrandSelector from '../components/AddPage/BrandSelector';
import VehicleFilter from '../components/AddPage/VehicleFilter';
import VehicleList from '../components/AddPage/VehicleList';
import AddVehicleDialog from '../components/AddPage/AddVehicleDialog';
import ConfirmReplaceDialog from '../components/AddPage/ConfirmReplaceDialog';
import Notification from '../components/AddPage/Notification';

interface AddPageProps {
  className?: string;
}

const AddPage: React.FC<AddPageProps> = ({ className }) => {
  // Get refresh function from context
  const { refreshHomePage } = useContext(RefreshContext);

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

  // 添加功能相关状态
  const [showPurchaseDialog, setShowPurchaseDialog] = useState<boolean>(false);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedTargetGarage, setSelectedTargetGarage] = useState<Garage | null>(null);
  const [purchaseStep, setPurchaseStep] = useState<'selectGarage' | 'selectPosition'>('selectGarage');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState<boolean>(false);
  const [targetPositionIndex, setTargetPositionIndex] = useState<number | null>(null);
  const [targetVehicle, setTargetVehicle] = useState<GarageVehicle | null>(null);
  // 通知功能相关状态
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');

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

  // 组件初始化时获取车库列表
  useEffect(() => {
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
  // const filteredBrands = brands.filter(brand =>
  //   brand.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   brand.brand_en.toLowerCase().includes(searchTerm.toLowerCase())
  // );

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

  // 页码重置逻辑已移到VehicleFilter.tsx和BrandSelector.tsx组件中

  // 总页数
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // 获取当前选中的品牌信息
  const currentBrand = brands.find(brand => brand.id === selectedBrand) || null;

  // 添加功能相关函数
  const handleOpenPurchaseDialog = async (vehicle: VehicleType) => {
    // 打开对话框前先获取最新的车库列表
    await fetchGarages();
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
      // 直接添加载具
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

      // 找到当前车库
      const targetGarageIndex = updatedGarages.findIndex(g => g.id === selectedTargetGarage.id);

      if (targetGarageIndex === -1) return;

      // 更新当前车库的载具列表
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

      // 显示成功通知
      setNotificationMessage('已新增载具');
      setShowNotification(true);

      // 3秒后自动隐藏通知
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      // 刷新HomePage以显示更新后的车库数据
      refreshHomePage();

      // 重新获取车库列表，确保数据最新
      fetchGarages();

      // 关闭对话框
      handleClosePurchaseDialog();
    } catch (err) {
      setError('添加载具时发生错误');
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
    <div className={`${styles.pageContainer} ${className}`}>
      {/* 通知组件 */}
      <Notification
        isVisible={showNotification}
        message={notificationMessage}
      />

      <div className={styles.brandContainer}>
        <BrandSelector
          brands={brands}
          selectedBrand={selectedBrand}
          searchTerm={searchTerm}
          onBrandSelect={setSelectedBrand}
          onSearchChange={setSearchTerm}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className={styles.vehicleContainer}>
        {loading && vehicles.length === 0 ? (
          <div className={styles.loadingContainer}>加载中...</div>
        ) : error ? (
          <div className={styles.errorContainer}>错误: {error}</div>
        ) : (currentBrand || selectedBrand === 'all') ? (
          <div className={styles.brandVehicleSection}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <VehicleFilter
                vehicleSearchTerm={vehicleSearchTerm}
                priceSort={priceSort}
                selectedVehicleType={selectedVehicleType}
                selectedFeature={selectedFeature}
                showUnavailableVehicles={showUnavailableVehicles}
                vehicleTypeDict={vehicleTypeDict}
                featureDict={featureDict}
                totalVehicles={filteredVehicles.length}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={totalPages}
                onVehicleSearchChange={setVehicleSearchTerm}
                onPriceSortChange={setPriceSort}
                onVehicleTypeChange={setSelectedVehicleType}
                onFeatureChange={setSelectedFeature}
                onShowUnavailableChange={setShowUnavailableVehicles}
                onResetFilters={() => {
                  setPriceSort(null);
                  setSelectedVehicleType(null);
                  setSelectedFeature(null);
                  setShowUnavailableVehicles(false);
                  setVehicleSearchTerm('');
                  setCurrentPage(1);
                }}
                onPageChange={setCurrentPage}
              />
            </div>

            <VehicleList
              vehicles={paginatedVehicles}
              brands={brands}
              featureDict={featureDict}
              onAddVehicle={handleOpenPurchaseDialog}
            />
          </div>
        ) : (
          <div className={styles.noBrandSelected}>请选择一个品牌</div>
        )}
      </div>

      {/* 添加载具对话框 */}
      <AddVehicleDialog
        isOpen={showPurchaseDialog}
        selectedVehicle={selectedVehicle}
        garages={garages}
        purchaseStep={purchaseStep}
        selectedTargetGarage={selectedTargetGarage}
        onClose={handleClosePurchaseDialog}
        onSelectGarage={handleSelectTargetGarage}
        onBackToGarageSelection={handleBackToGarageSelection}
        onSelectPosition={handleSelectTargetPosition}
      />

      {/* 覆盖载具确认对话框 */}
      <ConfirmReplaceDialog
        isOpen={showReplaceConfirm}
        selectedVehicle={selectedVehicle}
        targetVehicle={targetVehicle}
        targetPositionIndex={targetPositionIndex}
        onCancel={() => setShowReplaceConfirm(false)}
        onConfirm={async () => {
          if (targetPositionIndex !== null) {
            await handlePurchaseVehicle(targetPositionIndex);
          }
          setShowReplaceConfirm(false);
        }}
      />
    </div>
  );
};

export default AddPage;