import React, { useState, useEffect } from "react";
import styles from "../styles/pages/HomePage.module.css";
import { Garage, GarageVehicle } from "../types";
import {
  getGarages,
  addGarage,
  deleteGarage,
  updateGarage,
  getAllVehiclesFeature,
} from "../utils/api";
import GarageList from "../components/HomePage/GarageList";
import MoveVehicleDialog from "../components/HomePage/MoveVehicleDialog";
import ConfirmDeleteDialog from "../components/HomePage/ConfirmDeleteDialog";
import SwapVehicleDialog from "../components/HomePage/SwapVehicleDialog";
import Notification from "../components/HomePage/Notification";

const HomePage: React.FC = () => {
  // 状态管理
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // 通知功能相关状态
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");

  // 表单状态
  const [garageName, setGarageName] = useState<string>("");
  const [garageCapacity, setGarageCapacity] = useState<string>("");
  const [garageRemarks, setGarageRemarks] = useState<string>("");
  const [selectedGarageIds, setSelectedGarageIds] = useState<number[]>([]);

  // 处理车库容量输入，只允许输入1-100之间的数字
  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 只允许输入数字
    if (inputValue === "" || /^[0-9]+$/.test(inputValue)) {
      const numValue = parseInt(inputValue);

      // 如果是有效的数字且在1-100之间，则更新状态
      if (
        inputValue === "" ||
        (!isNaN(numValue) && numValue >= 1 && numValue <= 100)
      ) {
        setGarageCapacity(inputValue);
      }
    }
  };

  // 编辑备注状态
  const [editRemarks, setEditRemarks] = useState<string>("");

  // 确认框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // 显示通知消息
  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    // 3秒后自动隐藏通知
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // 载具移动功能状态
  const [showMoveDialog, setShowMoveDialog] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<{
    garageId: number;
    vehicleIndex: number;
    vehicleData: GarageVehicle;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        showNotificationMessage(response.error || "获取车库列表失败");
      }
    } catch (err) {
      showNotificationMessage("获取车库列表时发生错误");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取车库列表
  useEffect(() => {
    fetchGarages();
  }, []);

  // 处理新增车库
  const handleAddGarage = async () => {
    // 验证表单
    if (!garageName.trim()) {
      showNotificationMessage("请输入车库名称");
      return;
    }

    const capacity = parseInt(garageCapacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 100) {
      showNotificationMessage("请输入1-100之间的有效车库容量");
      return;
    }

    try {
      // 根据车库容量创建对应数量的空对象数组
      const emptyVehicles = Array(capacity).fill({});

      const newGarage: Omit<Garage, "id"> = {
        storageName: garageName.trim(),
        num: capacity,
        remarks: garageRemarks.trim() || undefined,
        vehicleList: emptyVehicles,
      };

      const response = await addGarage(newGarage);
      if (response.success && response.data) {
        // 添加成功，重新获取车库列表
        fetchGarages();
        // 清空表单
        setGarageName("");
        setGarageCapacity("");
        setGarageRemarks("");
      } else {
        showNotificationMessage(response.error || "添加车库失败");
      }
    } catch (err) {
      showNotificationMessage("添加车库时发生错误");
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
        showNotificationMessage("获取载具特性信息失败");
        return;
      }

      const featureMap = vehiclesFeatureResponse.data;
      let updatedCount = 0;

      // 遍历所有车库
      for (const garage of garages) {
        // 检查是否有需要更新的载具
        const hasVehiclesToUpdate = garage.vehicleList.some(
          (vehicle) => vehicle.id,
        );

        if (hasVehiclesToUpdate) {
          // 更新车库中的载具feature
          const updatedVehicleList = garage.vehicleList.map((vehicle) => {
            if (vehicle.id) {
              return {
                ...vehicle,
                feature: featureMap.get(vehicle.id) || "",
              };
            }
            return vehicle;
          });

          // 保存更新后的车库
          const updatedGarage = {
            ...garage,
            vehicleList: updatedVehicleList,
          };

          const updateResponse = await updateGarage(updatedGarage);
          if (updateResponse.success) {
            updatedCount++;
          }
        }
      }

      // 重新获取车库列表
      await fetchGarages();
      showNotificationMessage(
        `成功更新了 ${updatedCount} 个车库的载具特性信息`,
      );
    } catch (error) {
      console.error("更新载具特性信息失败:", error);
      showNotificationMessage("更新载具特性信息失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理确认删除
  const handleConfirmDelete = async () => {
    if (selectedGarageIds.length > 0) {
      try {
        // 批量删除选中的车库
        const deletePromises = selectedGarageIds.map((id) => deleteGarage(id));
        const results = await Promise.all(deletePromises);

        // 检查是否所有删除都成功
        const allSuccess = results.every((result) => result.success);

        if (allSuccess) {
          // 删除成功，重新获取车库列表
          fetchGarages();
          // 清除选中状态
          setSelectedGarageIds([]);
        } else {
          showNotificationMessage("部分车库删除失败");
        }
      } catch (err) {
        showNotificationMessage("删除车库时发生错误");
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



  // 处理保存备注
  const handleSaveRemarks = async (garageId: number) => {
    try {
      // 找到对应的车库
      const garage = garages.find((g) => g.id === garageId);
      if (!garage) return;

      // 更新本地状态
      const updatedGarage = {
        ...garage,
        remarks: editRemarks.trim() || undefined,
      };

      setGarages((prev) =>
        prev.map((g) => (g.id === garageId ? updatedGarage : g)),
      );

      // 发送API请求保存到后端
      const response = await updateGarage(updatedGarage);
      if (!response.success) {
        showNotificationMessage("保存备注失败");
        // 恢复原始状态
        fetchGarages();
      }
    } catch (err) {
      showNotificationMessage("保存备注时发生错误");
      console.error(err);
      // 恢复原始状态
      fetchGarages();
    } finally {
      // 退出编辑模式
      setEditRemarks("");
    }
  };



  // 载具移动功能相关函数
  const handleOpenMoveDialog = (
    garageId: number,
    vehicleIndex: number,
    vehicleData: GarageVehicle,
  ) => {
    setSelectedVehicle({
      garageId,
      vehicleIndex,
      vehicleData,
    });
    setShowMoveDialog(true);
  };

  const handleSelectTargetGarage = (garage: Garage) => {
    setSelectedTargetGarage(garage);
  };





  const handleSwapVehicles = async () => {
    if (!selectedVehicle || !swapTarget) return;

    try {
      // 复制当前车库状态
      const updatedGarages = [...garages];

      // 找到来源车库和目标车库
      const sourceGarageIndex = updatedGarages.findIndex(
        (g) => g.id === selectedVehicle.garageId,
      );
      const targetGarageIndex = updatedGarages.findIndex(
        (g) => g.id === swapTarget.garageId,
      );

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
          vehicleList,
        };
      } else {
        // 不同车库间交换
        const sourceVehicleList = [
          ...updatedGarages[sourceGarageIndex].vehicleList,
        ];
        const targetVehicleList = [
          ...updatedGarages[targetGarageIndex].vehicleList,
        ];

        // 交换载具
        const temp = sourceVehicleList[selectedVehicle.vehicleIndex];
        sourceVehicleList[selectedVehicle.vehicleIndex] =
          swapTarget.vehicleData;
        targetVehicleList[swapTarget.vehicleIndex] = temp;

        // 更新车库信息
        updatedGarages[sourceGarageIndex] = {
          ...updatedGarages[sourceGarageIndex],
          vehicleList: sourceVehicleList,
        };

        updatedGarages[targetGarageIndex] = {
          ...updatedGarages[targetGarageIndex],
          vehicleList: targetVehicleList,
        };
      }

      // 更新本地状态
      setGarages(updatedGarages);

      // 发送API请求保存到后端
      await Promise.all([
        updateGarage(updatedGarages[sourceGarageIndex]),
        updateGarage(updatedGarages[targetGarageIndex]),
      ]);

      // 关闭对话框
      handleCloseMoveDialog();
      setShowSwapConfirm(false);
      setSwapTarget(null);
    } catch (err) {
      showNotificationMessage("交换载具时发生错误");
      console.error(err);
    }
  };

  const handleCloseMoveDialog = () => {
    setShowMoveDialog(false);
    setSelectedVehicle(null);
    setSelectedTargetGarage(null);
  };



  // 处理车库选择
  const handleSelectGarage = (id: number) => {
    setSelectedGarageIds((prev) => {
      if (prev.includes(id)) {
        // 如果已选中，则移除
        return prev.filter((garageId) => garageId !== id);
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
      setSelectedGarageIds(garages.map((garage) => garage.id));
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* 使用新创建的通知组件 */}
      <Notification
        notification={showNotification ? { id: '1', message: notificationMessage, type: 'success' } : null}
        onClose={() => setShowNotification(false)}
      />

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
            <button onClick={handleUpdateVehicleFeatures} disabled={loading}>
              {loading ? "更新中..." : "更新数据"}
            </button>
          </div>
          <div className={styles.controlButton}>
            <button onClick={handleAddGarage} disabled={loading}>
              {loading ? "添加中..." : "新增"}
            </button>
          </div>
          <div className={styles.controlButton}>
            <button
              onClick={handleSelectAll}
              disabled={loading || garages.length === 0}
            >
              {selectedGarageIds.length === garages.length
                ? "取消全选"
                : "全选"}
            </button>
          </div>
          <div className={styles.controlButton}>
            <button
              onClick={handleOpenConfirmDialog}
              disabled={selectedGarageIds.length === 0}
              className={
                selectedGarageIds.length === 0 ? "" : styles.deleteButton
              }
            >
              删除 ({selectedGarageIds.length})
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
            <GarageList
              garages={garages}
              selectedGarageIds={selectedGarageIds}
              onGarageSelect={handleSelectGarage}
              onEditRemarks={handleSaveRemarks}
              onVehicleMove={handleOpenMoveDialog}
            />
          )}

          {/* 使用新创建的确认删除对话框组件 */}
          <ConfirmDeleteDialog
            isOpen={showConfirmDialog}
            title="确认删除"
            message={`确定删除选中的 ${selectedGarageIds.length} 个车库？`}
            onConfirm={handleConfirmDelete}
            onClose={handleCancelDelete}
          />

          {/* 使用新创建的移动载具对话框组件 */}
          <MoveVehicleDialog
            isOpen={showMoveDialog}
            vehicle={selectedVehicle?.vehicleData || null}
            garages={garages}
            onClose={handleCloseMoveDialog}
            onSelectGarage={(garageId) => handleSelectTargetGarage({ id: parseInt(garageId), storageName: '', num: 0, vehicleList: [] })}
          />

          {/* 使用新创建的交换载具对话框组件 */}
          <SwapVehicleDialog
            isOpen={showSwapConfirm}
            currentVehicle={selectedVehicle?.vehicleData || null}
            targetVehicle={swapTarget?.vehicleData || null}
            onClose={() => {
              setShowSwapConfirm(false);
              setSwapTarget(null);
            }}
            onConfirmSwap={handleSwapVehicles}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
