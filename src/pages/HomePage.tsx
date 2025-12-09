import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/pages/HomePage.module.css';
import { Garage, GarageVehicle } from '../types';
import { getGarages, addGarage, deleteGarage, updateGarage, getAllVehiclesFeature, getFeatureTypeDicts } from '../utils/api';

// 格式化价格函数
const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return '未知';
  if (price === 0) return '免费获取';
  if (price === -1) return '无法获取';
  return '$' + new Intl.NumberFormat('zh-CN').format(price);
};

// 特性配置数组 - 存储每个特性的文本、背景颜色和字体颜色
const featureConfig = [
  { text: 'BENNY', bgColor: '#CC5555', textColor: '#FFFFFF' },
  { text: 'IMANI', bgColor: '#3D9992', textColor: '#FFFFFF' },
  { text: 'HAO', bgColor: '#3499B2', textColor: '#FFFFFF' },
  { text: 'POLICE', bgColor: '#229954', textColor: '#FFFFFF' },
  { text: 'ARENA', bgColor: '#7D4693', textColor: '#FFFFFF' },
  { text: 'PEGASUS', bgColor: '#D35400', textColor: '#FFFFFF' },
  { text: 'DRIFT', bgColor: '#C0392B', textColor: '#FFFFFF' },
  { text: 'WEAPONIZED', bgColor: '#3f6d99ff', textColor: '#FFFFFF' },
  { text: 'NIGHTCLUB', bgColor: '#703688', textColor: '#FFFFFF' },
  { text: 'BUNKER', bgColor: '#6C7A7D', textColor: '#FFFFFF' },
  { text: 'WAREHOUSE', bgColor: '#A93226', textColor: '#FFFFFF' },
  { text: 'FACILITY', bgColor: '#138D75', textColor: '#FFFFFF' },
  { text: 'HANGAR', bgColor: '#6d2299ff', textColor: '#FFFFFF' },
  { text: 'SALVAGE YARDS', bgColor: '#228799ff', textColor: '#FFFFFF' },
  { text: 'FREAKSHOP', bgColor: '#999722ff', textColor: '#FFFFFF' },
  { text: 'KOSATKA', bgColor: '#99227fff', textColor: '#FFFFFF' },
  { text: 'ELECTRIC', bgColor: '#91a82cff', textColor: '#FFFFFF' },
  { text: 'ARMED', bgColor: '#99227fff', textColor: '#FFFFFF' },
  { text: 'ARMORED', bgColor: '#91a82cff', textColor: '#FFFFFF' }
];

// 创建特性映射以快速查找配置
const featureConfigMap = Object.fromEntries(
  featureConfig.map(feature => [feature.text, feature])
);

interface HomePageProps {
  className?: string;
}

const StorageListPage: React.FC<HomePageProps> = ({ className }) => {
  // 状态管理
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // 通知功能相关状态
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  // 特性字典状态
  const [featureDict, setFeatureDict] = useState<Record<string, string>>({});

  // 表单状态
  const [garageName, setGarageName] = useState<string>('');
  const [garageCapacity, setGarageCapacity] = useState<string>('');
  const [garageRemarks, setGarageRemarks] = useState<string>('');
  const [selectedGarageIds, setSelectedGarageIds] = useState<number[]>([]);

  // 处理车库容量输入，只允许输入1-100之间的数字
  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 只允许输入数字
    if (inputValue === '' || /^[0-9]+$/.test(inputValue)) {
      const numValue = parseInt(inputValue);

      // 如果是有效的数字且在1-100之间，则更新状态
      if (inputValue === '' || (!isNaN(numValue) && numValue >= 1 && numValue <= 100)) {
        setGarageCapacity(inputValue);
      }
    }
  };

  // 编辑备注状态
  const [editingRemarksId, setEditingRemarksId] = useState<number | null>(null);
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 确认框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  // 载具删除确认对话框状态
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState<boolean>(false);
  const [selectedVehicleToDelete, setSelectedVehicleToDelete] = useState<{
    garageId: number;
    vehicleIndex: number;
    vehicleData: GarageVehicle;
  } | null>(null);

  // 显示通知消息
  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    // 3秒后自动隐藏通知
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // 获取特性字典
  const fetchFeatureTypeDicts = async () => {
    try {
      const response = await getFeatureTypeDicts();
      if (response.success && response.data) {
        setFeatureDict(response.data);
      } else {
        console.error('获取特性类型字典失败:', response.error);
      }
    } catch (err) {
      console.error('获取特性类型字典时发生错误:', err);
    }
  };

  // 载具移动功能状态
  const [showMoveDialog, setShowMoveDialog] = useState<boolean>(false);
  const [moveStep, setMoveStep] = useState<'selectGarage' | 'selectPosition'>('selectGarage');
  const [selectedVehicle, setSelectedVehicle] = useState<{
    garageId: number;
    vehicleIndex: number;
    vehicleData: GarageVehicle;
  } | null>(null);
  const [selectedTargetGarage, setSelectedTargetGarage] = useState<Garage | null>(null);
  const [showSwapConfirm, setShowSwapConfirm] = useState<boolean>(false);
  const [swapTarget, setSwapTarget] = useState<{
    garageId: number;
    vehicleIndex: number;
    vehicleData: GarageVehicle;
  } | null>(null);

  // 获取车库列表
  const fetchGarages = async () => {
    setLoading(true);
    try {
      const response = await getGarages();
      if (response.success && response.data) {
        setGarages(response.data);
      } else {
        showNotificationMessage(response.error || '获取车库列表失败');
      }
    } catch (err) {
      showNotificationMessage('获取车库列表时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取车库列表和特性字典
  useEffect(() => {
    fetchGarages();
    fetchFeatureTypeDicts();
  }, []);

  // 处理新增车库
  const handleAddGarage = async () => {
    // 验证表单
    if (!garageName.trim()) {
      showNotificationMessage('请输入车库名称');
      return;
    }

    const capacity = parseInt(garageCapacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 100) {
      showNotificationMessage('请输入1-100之间的有效车库容量');
      return;
    }

    try {
      // 根据车库容量创建对应数量的空对象数组
      const emptyVehicles = Array(capacity).fill({});

      const newGarage: Omit<Garage, 'id'> = {
        storageName: garageName.trim(),
        num: capacity,
        remarks: garageRemarks.trim() || undefined,
        vehicleList: emptyVehicles
      };

      const response = await addGarage(newGarage);
      if (response.success && response.data) {
        // 添加成功，重新获取车库列表
        fetchGarages();
        // 清空表单
        setGarageName('');
        setGarageCapacity('');
        setGarageRemarks('');
      } else {
        showNotificationMessage(response.error || '添加车库失败');
      }
    } catch (err) {
      showNotificationMessage('添加车库时发生错误');
      console.error(err);
    }
  };

  // 打开确认删除对话框
  const handleOpenConfirmDialog = () => {
    // 只有当有选中的车库时才打开确认框
    if (selectedGarageIds.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  // 更新车库中所有载具的feature信息
  const handleUpdateVehicleFeatures = async () => {
    setLoading(true);
    try {
      // 获取所有载具的feature信息
      const vehiclesFeatureResponse = await getAllVehiclesFeature();
      if (!vehiclesFeatureResponse.success || !vehiclesFeatureResponse.data) {
        showNotificationMessage('获取载具特性信息失败');
        return;
      }

      const featureMap = vehiclesFeatureResponse.data;
      let updatedCount = 0;

      // 遍历所有车库
      for (const garage of garages) {
        // 检查是否有需要更新的载具
        const hasVehiclesToUpdate = garage.vehicleList.some(vehicle =>
          vehicle.id && featureMap.has(vehicle.id)
        );

        if (hasVehiclesToUpdate) {
          // 更新车库中的载具feature
          const updatedVehicleList = garage.vehicleList.map(vehicle => {
            if (vehicle.id && featureMap.has(vehicle.id)) {
              return {
                ...vehicle,
                feature: featureMap.get(vehicle.id) || ''
              };
            }
            return vehicle;
          });

          // 保存更新后的车库
          const updatedGarage = {
            ...garage,
            vehicleList: updatedVehicleList
          };

          const updateResponse = await updateGarage(updatedGarage);
          if (updateResponse.success) {
            updatedCount++;
          }
        }
      }

      // 重新获取车库列表
      await fetchGarages();
      showNotificationMessage(`成功更新了 ${updatedCount} 个车库的载具特性信息`);
    } catch (error) {
      console.error('更新载具特性信息失败:', error);
      showNotificationMessage('更新载具特性信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理确认删除
  const handleConfirmDelete = async () => {
    if (selectedGarageIds.length > 0) {
      try {
        // 批量删除选中的车库
        const deletePromises = selectedGarageIds.map(id => deleteGarage(id));
        const results = await Promise.all(deletePromises);

        // 检查是否所有删除都成功
        const allSuccess = results.every(result => result.success);

        if (allSuccess) {
          // 删除成功，重新获取车库列表
          fetchGarages();
          // 清除选中状态
          setSelectedGarageIds([]);
        } else {
          showNotificationMessage('部分车库删除失败');
        }
      } catch (err) {
        showNotificationMessage('删除车库时发生错误');
        console.error(err);
      } finally {
        // 关闭确认框
        setShowConfirmDialog(false);
      }
    }
  };

  // 处理取消删除
  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  // 处理打开备注编辑
  const handleOpenEditRemarks = (garage: Garage) => {
    setEditingRemarksId(garage.id);
    setEditRemarks(garage.remarks || '');
    setIsUnsaved(false);

    // 在下一个渲染周期聚焦输入框
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 0);
  };

  // 处理保存备注
  const handleSaveRemarks = async (garageId: number) => {
    try {
      // 找到对应的车库
      const garage = garages.find(g => g.id === garageId);
      if (!garage) return;

      // 更新本地状态
      const updatedGarage = {
        ...garage,
        remarks: editRemarks.trim() || undefined
      };

      setGarages(prev => prev.map(g =>
        g.id === garageId ? updatedGarage : g
      ));

      // 发送API请求保存到后端
      const response = await updateGarage(updatedGarage);
      if (!response.success) {
        showNotificationMessage('保存备注失败');
        // 恢复原始状态
        fetchGarages();
      } else {
        setIsUnsaved(false);
      }
    } catch (err) {
      showNotificationMessage('保存备注时发生错误');
      console.error(err);
      // 恢复原始状态
      fetchGarages();
    } finally {
      // 退出编辑模式
      setEditingRemarksId(null);
      setEditRemarks('');
    }
  };

  // 处理取消编辑备注
  const handleCancelEditRemarks = () => {
    setEditingRemarksId(null);
    setEditRemarks('');
  };

  // 载具移动功能相关函数
  const handleOpenMoveDialog = (garageId: number, vehicleIndex: number, vehicleData: GarageVehicle) => {
    setSelectedVehicle({
      garageId,
      vehicleIndex,
      vehicleData
    });
    setMoveStep('selectGarage');
    setShowMoveDialog(true);
  };

  // 载具删除功能相关函数
  const handleOpenDeleteConfirmDialog = (garageId: number, vehicleIndex: number, vehicleData: GarageVehicle) => {
    setSelectedVehicleToDelete({
      garageId,
      vehicleIndex,
      vehicleData
    });
    setShowDeleteConfirmDialog(true);
  };

  const handleCancelDeleteVehicle = () => {
    setShowDeleteConfirmDialog(false);
    setSelectedVehicleToDelete(null);
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!selectedVehicleToDelete) return;

    try {
      // 获取当前车库
      const garageIndex = garages.findIndex(g => g.id === selectedVehicleToDelete.garageId);
      if (garageIndex === -1) return;

      // 创建新的载具列表，将指定位置的载具设置为空对象
      const updatedGarage = {
        ...garages[garageIndex],
        vehicleList: garages[garageIndex].vehicleList.map((vehicle, index) =>
          index === selectedVehicleToDelete.vehicleIndex ? {} as any : vehicle
        )
      };

      // 更新车库
      const updateResponse = await updateGarage(updatedGarage);
      if (updateResponse.success) {
        // 更新本地状态
        const updatedGarages = [...garages];
        updatedGarages[garageIndex] = updatedGarage;
        setGarages(updatedGarages);

        // 显示成功通知
        showNotificationMessage('载具已删除');
      } else {
        showNotificationMessage('删除载具失败');
      }
    } catch (error) {
      console.error('删除载具时发生错误:', error);
      showNotificationMessage('删除载具时发生错误');
    } finally {
      // 关闭对话框
      setShowDeleteConfirmDialog(false);
      setSelectedVehicleToDelete(null);
    }
  };

  const handleSelectTargetGarage = (garage: Garage) => {
    setSelectedTargetGarage(garage);
    setMoveStep('selectPosition');
  };

  const handleSelectTargetPosition = async (targetIndex: number) => {
    if (!selectedVehicle || !selectedTargetGarage) return;

    const targetVehicle = selectedTargetGarage.vehicleList[targetIndex];
    const isTargetEmpty = Object.keys(targetVehicle).length === 0;

    if (isTargetEmpty) {
      // 直接移动载具
      await handleMoveVehicle(targetIndex);
    } else {
      // 交换载具
      setSwapTarget({
        garageId: selectedTargetGarage.id,
        vehicleIndex: targetIndex,
        vehicleData: targetVehicle
      });
      setShowSwapConfirm(true);
    }
  };

  const handleMoveVehicle = async (targetIndex: number) => {
    if (!selectedVehicle || !selectedTargetGarage) return;

    try {
      // 复制当前车库状态
      const updatedGarages = [...garages];

      // 找到来源车库和目标车库
      const sourceGarageIndex = updatedGarages.findIndex(g => g.id === selectedVehicle.garageId);
      const targetGarageIndex = updatedGarages.findIndex(g => g.id === selectedTargetGarage.id);

      if (sourceGarageIndex === -1 || targetGarageIndex === -1) return;

      // 处理载具移动
      if (sourceGarageIndex === targetGarageIndex) {
        // 同一车库内移动
        const vehicleList = [...updatedGarages[sourceGarageIndex].vehicleList];
        const vehicleToMove = vehicleList[selectedVehicle.vehicleIndex];
        vehicleList[selectedVehicle.vehicleIndex] = {} as any; // 清空原位置
        vehicleList[targetIndex] = vehicleToMove; // 移动到新位置

        // 更新车库信息
        updatedGarages[sourceGarageIndex] = {
          ...updatedGarages[sourceGarageIndex],
          vehicleList
        };
      } else {
        // 不同车库间移动
        const sourceVehicleList = [...updatedGarages[sourceGarageIndex].vehicleList];
        const targetVehicleList = [...updatedGarages[targetGarageIndex].vehicleList];

        // 移动载具
        const vehicleToMove = sourceVehicleList[selectedVehicle.vehicleIndex];
        sourceVehicleList[selectedVehicle.vehicleIndex] = {} as any; // 清空原位置
        targetVehicleList[targetIndex] = vehicleToMove; // 移动到新位置

        // 更新车库信息
        updatedGarages[sourceGarageIndex] = {
          ...updatedGarages[sourceGarageIndex],
          vehicleList: sourceVehicleList
        };

        updatedGarages[targetGarageIndex] = {
          ...updatedGarages[targetGarageIndex],
          vehicleList: targetVehicleList
        };
      }

      // 更新本地状态
      setGarages(updatedGarages);

      // 发送API请求保存到后端
      await Promise.all([
        updateGarage(updatedGarages[sourceGarageIndex]),
        updateGarage(updatedGarages[targetGarageIndex])
      ]);

      // 关闭对话框
      handleCloseMoveDialog();
    } catch (err) {
      showNotificationMessage('移动载具时发生错误');
      console.error(err);
    }
  };

  const handleSwapVehicles = async () => {
    if (!selectedVehicle || !swapTarget) return;

    try {
      // 复制当前车库状态
      const updatedGarages = [...garages];

      // 找到来源车库和目标车库
      const sourceGarageIndex = updatedGarages.findIndex(g => g.id === selectedVehicle.garageId);
      const targetGarageIndex = updatedGarages.findIndex(g => g.id === swapTarget.garageId);

      if (sourceGarageIndex === -1 || targetGarageIndex === -1) return;

      // 处理载具交换
      if (sourceGarageIndex === targetGarageIndex) {
        // 同一车库内交换
        const vehicleList = [...updatedGarages[sourceGarageIndex].vehicleList];

        // 交换载具
        const temp = vehicleList[selectedVehicle.vehicleIndex];
        vehicleList[selectedVehicle.vehicleIndex] = swapTarget.vehicleData;
        vehicleList[swapTarget.vehicleIndex] = temp;

        // 更新车库信息
        updatedGarages[sourceGarageIndex] = {
          ...updatedGarages[sourceGarageIndex],
          vehicleList
        };
      } else {
        // 不同车库间交换
        const sourceVehicleList = [...updatedGarages[sourceGarageIndex].vehicleList];
        const targetVehicleList = [...updatedGarages[targetGarageIndex].vehicleList];

        // 交换载具
        const temp = sourceVehicleList[selectedVehicle.vehicleIndex];
        sourceVehicleList[selectedVehicle.vehicleIndex] = swapTarget.vehicleData;
        targetVehicleList[swapTarget.vehicleIndex] = temp;

        // 更新车库信息
        updatedGarages[sourceGarageIndex] = {
          ...updatedGarages[sourceGarageIndex],
          vehicleList: sourceVehicleList
        };

        updatedGarages[targetGarageIndex] = {
          ...updatedGarages[targetGarageIndex],
          vehicleList: targetVehicleList
        };
      }

      // 更新本地状态
      setGarages(updatedGarages);

      // 发送API请求保存到后端
      await Promise.all([
        updateGarage(updatedGarages[sourceGarageIndex]),
        updateGarage(updatedGarages[targetGarageIndex])
      ]);

      // 关闭对话框
      handleCloseMoveDialog();
      setShowSwapConfirm(false);
      setSwapTarget(null);
    } catch (err) {
      showNotificationMessage('交换载具时发生错误');
      console.error(err);
    }
  };

  const handleCloseMoveDialog = () => {
    setShowMoveDialog(false);
    setSelectedVehicle(null);
    setSelectedTargetGarage(null);
    setMoveStep('selectGarage');
  };

  const handleBackToGarageSelection = () => {
    setMoveStep('selectGarage');
    setSelectedTargetGarage(null);
  };

  // 处理车库选择
  const handleSelectGarage = (id: number) => {
    setSelectedGarageIds(prev => {
      if (prev.includes(id)) {
        // 如果已选中，则移除
        return prev.filter(garageId => garageId !== id);
      } else {
        // 如果未选中，则添加
        return [...prev, id];
      }
    });
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedGarageIds.length === garages.length) {
      // 如果已经全选，则取消全选
      setSelectedGarageIds([]);
    } else {
      // 否则全选所有车库
      setSelectedGarageIds(garages.map(garage => garage.id));
    }
  };

  return (
    <div className={`${styles.mainContainer} ${className}`}>
      {/* 通知组件 */}
      <div className={`${styles.notification} ${showNotification ? styles.notificationVisible : ''}`}>
        {notificationMessage}
      </div>

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

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>加载中...</div>
        </div>
      ) : (
        <div className={styles.storageListContainer}>
          {garages.length === 0 ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyText}>空</div>
            </div>
          ) : (
            garages.map((item) => {
              const isSelected = selectedGarageIds.includes(item.id);
              return (
                <div
                  className={`${styles.storageItem} ${isSelected ? styles.selectedStorageItem : ''}`}
                  key={item.id}
                >
                  <div className={styles.storageItemHeader}>
                    <div
                      className={styles.checkboxContainer}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectGarage(item.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectGarage(item.id);
                        }}
                      />
                      <label className={styles.checkboxLabel}></label>
                    </div>
                    <div className={styles.storageInfo}>
                      <div className={styles.storageDetails}>
                        <div className={styles.storageName}>{item.storageName}</div>
                      </div>
                      <div className={styles.remarksContainer}>
                        {editingRemarksId === item.id ? (
                          <div className={styles.editRemarksContainer}>
                            <input
                              ref={editInputRef}
                              type="text"
                              className={`${styles.editRemarksInput} ${isUnsaved ? styles.unsavedInput : ''}`}
                              value={editRemarks}
                              onChange={(e) => {
                                setEditRemarks(e.target.value);
                                setIsUnsaved(true);
                              }}
                              onBlur={() => setIsUnsaved(true)}
                              onFocus={() => setIsUnsaved(false)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveRemarks(item.id);
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
                            {item.remarks || '暂无备注'}
                          </div>
                        )}
                        <button
                          className={styles.editRemarksButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editingRemarksId === item.id) {
                              handleSaveRemarks(item.id);
                            } else {
                              handleOpenEditRemarks(item);
                            }
                          }}
                        >
                          <img
                            src={editingRemarksId === item.id ? '/save.png' : '/edit.png'}
                            alt={editingRemarksId === item.id ? '保存' : '编辑'}
                            style={{ width: '25px', height: '25px', display: 'block', cursor: 'pointer' }}
                          />
                        </button>
                      </div>
                      <div className={styles.storageNumContainer}>
                        <div className={styles.storageNum}>
                          {item.vehicleList.filter(vehicle => Object.keys(vehicle).length > 0).length}/{item.num}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.vehicleList}>
                    {item.vehicleList.map((vehicle: GarageVehicle, index: number) => {
                      // 检查载具是否为空对象
                      const isEmptyVehicle = Object.keys(vehicle).length === 0;

                      return (
                        <div className={styles.vehicleItem} key={index}>
                          {!isEmptyVehicle && (
                            <div className={styles.vehicleButtons}>
                              <button
                                className={styles.moveVehicleButton}
                                onClick={() => handleOpenMoveDialog(item.id, index, vehicle)}
                              >
                                <img
                                  src="/move.png"
                                  style={{ display: 'block', cursor: 'pointer' }}
                                />
                              </button>
                              <button
                                className={styles.deleteVehicleButton}
                                onClick={() => handleOpenDeleteConfirmDialog(item.id, index, vehicle)}
                              >
                                <img
                                  src="/delete.png"
                                  style={{ display: 'block', cursor: 'pointer' }}
                                />
                              </button>
                            </div>
                          )}
                          <div className={styles.vehicleInfo}>
                            {isEmptyVehicle ? (
                              // 空载具显示"空"
                              <div className={styles.emptyVehicleText}></div>
                            ) : (
                              // 有内容的载具显示详细信息
                              <>
                                <div className={styles.vehicleBrand}>{vehicle.brandName}</div>
                                <div className={styles.vehicleName}>{vehicle.vehicleName}</div>
                                <div className={styles.vehicleType}>{vehicle.vehicle_type}</div>
                                <div className={styles.vehiclePrice}>
                                  {formatPrice(vehicle.price)}
                                </div>
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

                                      // 如果找到配置，使用配置的样式；否则使用默认样式
                                      const style = featureInfo ? {
                                        backgroundColor: featureInfo.bgColor,
                                        color: featureInfo.textColor
                                      } : {};

                                      // 获取中文特性名称
                                      const translatedFeature = featureDict[cleanFeatureText] || cleanFeatureText;

                                      return (
                                        <div
                                          className={styles.featureItem}
                                          style={style}
                                          key={index}
                                        >
                                          {translatedFeature}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 自定义确认删除对话框 */}
      {showConfirmDialog && (
        <div className={styles.confirmDialogOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmDialogHeader}>
              <h3>确认</h3>
            </div>
            <div className={styles.confirmDialogContent}>
              <p>确定删除选中的 {selectedGarageIds.length} 个车库？</p>
              <p>Are you sure you want to delete the selected {selectedGarageIds.length} garages?</p>
            </div>
            <div className={styles.confirmDialogActions}>
              <button
                className={styles.confirmDialogCancel}
                onClick={handleCancelDelete}
              >
                取消
              </button>
              <button
                className={styles.confirmDialogConfirm}
                onClick={handleConfirmDelete}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 载具删除确认对话框 */}
      {showDeleteConfirmDialog && selectedVehicleToDelete && (
        <div className={styles.confirmDialogOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmDialogHeader}>
              <h3>确认删除</h3>
            </div>
            <div className={styles.confirmDialogContent}>
              <p>确定从车库 <span style={{ fontSize: '22px' }}>{garages.find(g => g.id === selectedVehicleToDelete.garageId)?.storageName || '未知车库'}</span> 删除 <span style={{ fontSize: '22px', color: '#ffffff' }}>{selectedVehicleToDelete.vehicleData.brandName} {selectedVehicleToDelete.vehicleData.vehicleName}</span></p>
            </div>
            <div className={styles.confirmDialogActions}>
              <button
                className={styles.confirmDialogCancel}
                onClick={handleCancelDeleteVehicle}
              >
                取消
              </button>
              <button
                className={styles.confirmDialogConfirm}
                onClick={handleConfirmDeleteVehicle}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 移动载具对话框 */}
      {showMoveDialog && (
        <div className={styles.moveDialogOverlay}>
          <div className={styles.moveDialog}>
            <div className={styles.moveDialogHeader}>
              <h3>移动载具</h3>
              <button className={styles.closeButton} onClick={handleCloseMoveDialog}>
                ×
              </button>
            </div>
            <div className={styles.moveDialogContent}>
              {moveStep === 'selectGarage' && (
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

              {moveStep === 'selectPosition' && selectedTargetGarage && (
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
                      const isCurrentVehicle = selectedVehicle?.garageId === selectedTargetGarage.id &&
                        selectedVehicle?.vehicleIndex === index;
                      return (
                        <div
                          key={index}
                          className={`${styles.positionOption} 
                            ${isEmpty ? styles.emptyPosition : styles.occupiedPosition} 
                            ${isCurrentVehicle ? styles.currentVehiclePosition : ''}`}
                          onClick={() => !isCurrentVehicle && handleSelectTargetPosition(index)}
                        >
                          <div className={styles.positionNumber}>位置 {index + 1}</div>
                          {isEmpty ? (
                            <div className={styles.positionStatus}>空</div>
                          ) : (
                            <div className={styles.positionVehicle}>
                              {`${vehicle.brandName} ${vehicle.vehicleName}`}
                            </div>
                          )}
                          {isCurrentVehicle && (
                            <div className={styles.currentVehicleMarker}>正在移动的载具</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className={styles.moveDialogActions}>
              {moveStep === 'selectGarage' && (
                <button
                  className={styles.confirmDialogCancel}
                  onClick={handleCloseMoveDialog}
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 交换载具确认对话框 */}
      {showSwapConfirm && swapTarget && selectedVehicle && (
        <div className={styles.swapDialogOverlay}>
          <div className={styles.swapDialog}>
            <div className={styles.swapDialogHeader}>
              <h3>确认交换</h3>
            </div>
            <div className={styles.swapDialogContent}>
              <p>确定要交换以下载具吗？</p>
              <div className={styles.swapInfo}>
                <div className={styles.swapVehicle}>
                  <h5>来源载具：</h5>
                  <p>{`${selectedVehicle.vehicleData.brandName} ${selectedVehicle.vehicleData.vehicleName}`}</p>
                  <p className={styles.swapVehicleLocation}>
                    位置：车库 {garages.find(g => g.id === selectedVehicle.garageId)?.storageName} 位置 {selectedVehicle.vehicleIndex + 1}
                  </p>
                </div>
                <div className={styles.swapArrow}>↔️</div>
                <div className={styles.swapVehicle}>
                  <h5>目标载具：</h5>
                  <p>{`${swapTarget.vehicleData.brandName} ${swapTarget.vehicleData.vehicleName}`}</p>
                  <p className={styles.swapVehicleLocation}>
                    位置：车库 {garages.find(g => g.id === swapTarget.garageId)?.storageName} 位置 {swapTarget.vehicleIndex + 1}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.swapDialogActions}>
              <button
                className={styles.confirmDialogCancel}
                onClick={() => {
                  setShowSwapConfirm(false);
                  setSwapTarget(null);
                }}
              >
                取消
              </button>
              <button
                className={styles.confirmDialogConfirm}
                onClick={handleSwapVehicles}
              >
                确认交换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageListPage;