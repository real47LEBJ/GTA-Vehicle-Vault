import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/pages/HomePage.module.css';
import { Garage, GarageVehicle } from '../types';
import { getGarages, addGarage, deleteGarage, updateGarage, getAllVehiclesFeature, getFeatureTypeDicts } from '../utils/api';
import Notification from '../components/HomePage/Notification';
import ControlPanel from '../components/HomePage/ControlPanel';
import Loading from '../components/HomePage/Loading';
import GarageItem from '../components/HomePage/GarageItem';

import ConfirmDialog from '../components/HomePage/ConfirmDialog';
import VehicleDeleteConfirmDialog from '../components/HomePage/VehicleDeleteConfirmDialog';
import MoveDialog from '../components/HomePage/MoveDialog';
import SwapConfirmDialog from '../components/HomePage/SwapConfirmDialog';

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
      showNotificationMessage('载具特性信息已更新');
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
          // 显示成功提示
          showNotificationMessage('已选车库已删除');
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

      // 显示成功通知
      showNotificationMessage('已移动载具');

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

      // 显示成功通知
      showNotificationMessage('已移动载具');

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
      <Notification showNotification={showNotification} notificationMessage={notificationMessage} />

      <ControlPanel
        garageName={garageName}
        setGarageName={setGarageName}
        garageCapacity={garageCapacity}
        setGarageCapacity={(capacity) => setGarageCapacity(capacity)}
        handleCapacityChange={handleCapacityChange}
        garageRemarks={garageRemarks}
        setGarageRemarks={setGarageRemarks}
        loading={loading}
        handleAddGarage={handleAddGarage}
        handleSelectAll={handleSelectAll}
        selectedGarageIds={selectedGarageIds}
        handleOpenConfirmDialog={handleOpenConfirmDialog}
        handleUpdateVehicleFeatures={handleUpdateVehicleFeatures}
        garages={garages}
      />

      {loading ? (
        <Loading loading={loading} />
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
                <GarageItem
                  key={item.id}
                  garage={item}
                  isSelected={isSelected}
                  editingRemarksId={editingRemarksId}
                  editRemarks={editRemarks}
                  isUnsaved={isUnsaved}
                  editInputRef={editInputRef as React.RefObject<HTMLInputElement>}
                  handleSelectGarage={handleSelectGarage}
                  handleOpenEditRemarks={handleOpenEditRemarks}
                  handleSaveRemarks={handleSaveRemarks}
                  handleCancelEditRemarks={handleCancelEditRemarks}
                  handleOpenMoveDialog={handleOpenMoveDialog}
                  handleOpenDeleteConfirmDialog={handleOpenDeleteConfirmDialog}
                  featureDict={featureDict}
                />
              );
            })
          )}
        </div>
      )}

      {/* 确认删除对话框 */}
      <ConfirmDialog
        showConfirmDialog={showConfirmDialog}
        selectedGarageIds={selectedGarageIds}
        handleCancelDelete={handleCancelDelete}
        handleConfirmDelete={handleConfirmDelete}
      />

      {/* 载具删除确认对话框 */}
      <VehicleDeleteConfirmDialog
        showDeleteConfirmDialog={showDeleteConfirmDialog}
        selectedVehicleToDelete={selectedVehicleToDelete}
        garages={garages}
        handleCancelDeleteVehicle={handleCancelDeleteVehicle}
        handleConfirmDeleteVehicle={handleConfirmDeleteVehicle}
      />

      {/* 移动载具对话框 */}
      <MoveDialog
        showMoveDialog={showMoveDialog}
        moveStep={moveStep === 'selectGarage' ? 1 : 2}
        selectedVehicleToMove={selectedVehicle}
        garages={garages}
        targetGarageId={selectedTargetGarage?.id || 0}
        targetVehicleIndex={selectedTargetGarage ? 0 : 0}
        handleSelectTargetGarage={(garageId) => handleSelectTargetGarage(garages.find(g => g.id === garageId)!)}
        handleSelectTargetPosition={handleSelectTargetPosition}
        handleCancelMove={handleCloseMoveDialog}
        handleMoveVehicle={() => setMoveStep('selectPosition')}
        handleBackToSelectGarage={() => setMoveStep('selectGarage')}
      />

      {/* 交换载具确认对话框 */}
      <SwapConfirmDialog
        showSwapConfirmDialog={showSwapConfirm}
        swapSource={selectedVehicle}
        swapTarget={swapTarget}
        garages={garages}
        handleCancelSwap={() => {
          setShowSwapConfirm(false);
          setSwapTarget(null);
        }}
        handleSwapVehicles={handleSwapVehicles}
      />
    </div>
  );
};

export default StorageListPage;