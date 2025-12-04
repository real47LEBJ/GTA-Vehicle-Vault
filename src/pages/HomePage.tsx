import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/pages/HomePage.module.css';
import { Garage, GarageVehicle } from '../types';
import { getGarages, addGarage, deleteGarage, updateGarage } from '../utils/api';

const StorageListPage: React.FC = () => {
  // 状态管理
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 表单状态
  const [garageName, setGarageName] = useState<string>('');
  const [garageCapacity, setGarageCapacity] = useState<string>('');
  const [garageRemarks, setGarageRemarks] = useState<string>('');
  const [selectedGarageIds, setSelectedGarageIds] = useState<number[]>([]);

  // 编辑备注状态
  const [editingRemarksId, setEditingRemarksId] = useState<number | null>(null);
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 确认框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // 车辆移动功能状态
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
    setError(null);
    try {
      const response = await getGarages();
      if (response.success && response.data) {
        setGarages(response.data);
      } else {
        setError(response.error || '获取车库列表失败');
      }
    } catch (err) {
      setError('获取车库列表时发生错误');
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
      setError('请输入车库名称');
      return;
    }

    const capacity = parseInt(garageCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      setError('请输入有效的车库容量');
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
        setError(null);
      } else {
        setError(response.error || '添加车库失败');
      }
    } catch (err) {
      setError('添加车库时发生错误');
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
          setError(null);
        } else {
          setError('部分车库删除失败');
        }
      } catch (err) {
        setError('删除车库时发生错误');
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
        setError('保存备注失败');
        // 恢复原始状态
        fetchGarages();
      } else {
        setIsUnsaved(false);
      }
    } catch (err) {
      setError('保存备注时发生错误');
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

  // 车辆移动功能相关函数
  const handleOpenMoveDialog = (garageId: number, vehicleIndex: number, vehicleData: GarageVehicle) => {
    setSelectedVehicle({
      garageId,
      vehicleIndex,
      vehicleData
    });
    setMoveStep('selectGarage');
    setShowMoveDialog(true);
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
      // 直接移动车辆
      await handleMoveVehicle(targetIndex);
    } else {
      // 交换车辆
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

      // 处理车辆移动
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

        // 移动车辆
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
      setError('移动车辆时发生错误');
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

      // 处理车辆交换
      if (sourceGarageIndex === targetGarageIndex) {
        // 同一车库内交换
        const vehicleList = [...updatedGarages[sourceGarageIndex].vehicleList];

        // 交换车辆
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

        // 交换车辆
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
      setError('交换车辆时发生错误');
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
    <div className={styles.mainContainer}>
      {/* 错误信息显示 */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

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
              type="number"
              placeholder="请输入车库容量"
              value={garageCapacity}
              onChange={(e) => setGarageCapacity(e.target.value)}
              min="1"
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
              <div className={styles.emptyText}>暂无车库，请添加新车库</div>
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
                          title={editingRemarksId === item.id ? '保存备注' : '编辑备注'}
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
                      // 检查车辆是否为空对象
                      const isEmptyVehicle = Object.keys(vehicle).length === 0;

                      return (
                        <div className={styles.vehicleItem} key={index}>
                          {!isEmptyVehicle && (
                            <button
                              className={styles.moveVehicleButton}
                              onClick={() => handleOpenMoveDialog(item.id, index, vehicle)}
                              title="移动车辆"
                            >
                              🚗
                            </button>
                          )}
                          <div className={styles.vehicleInfo}>
                            {isEmptyVehicle ? (
                              // 空车辆显示"空"
                              <div className={styles.emptyVehicleText}>空</div>
                            ) : (
                              // 有内容的车辆显示详细信息
                              <>
                                <div className={styles.vehicleName}>{`${vehicle.brandName} ${vehicle.vehicleName}`}</div>
                                <div className={styles.vehicleNameEn}>{`${vehicle.brandNameEn} ${vehicle.vehicleNameEn}`}</div>
                                <div className={styles.vehicleFeature}>
                                  {vehicle.feature ? (
                                    vehicle.feature.split(',').map((feature, idx) => {
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
                                            return { text: featureNum, class: styles.featureItem };
                                        }
                                      };
                                      const featureInfo = getFeatureInfo(feature);
                                      return (
                                        <div className={[styles.featureItem, featureInfo.class].join(' ')} key={idx}>
                                          {featureInfo.text}
                                        </div>
                                      );
                                    })
                                  ) : <div>&nbsp;</div>}
                                </div>
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

      {/* 移动车辆对话框 */}
      {showMoveDialog && (
        <div className={styles.moveDialogOverlay}>
          <div className={styles.moveDialog}>
            <div className={styles.moveDialogHeader}>
              <h3>移动车辆</h3>
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
                            <div className={styles.currentVehicleMarker}>正在移动的车辆</div>
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

      {/* 交换车辆确认对话框 */}
      {showSwapConfirm && swapTarget && selectedVehicle && (
        <div className={styles.swapDialogOverlay}>
          <div className={styles.swapDialog}>
            <div className={styles.swapDialogHeader}>
              <h3>确认交换</h3>
            </div>
            <div className={styles.swapDialogContent}>
              <p>确定要交换以下车辆吗？</p>
              <div className={styles.swapInfo}>
                <div className={styles.swapVehicle}>
                  <h5>来源车辆：</h5>
                  <p>{`${selectedVehicle.vehicleData.brandName} ${selectedVehicle.vehicleData.vehicleName}`}</p>
                  <p className={styles.swapVehicleLocation}>
                    位置：车库 {garages.find(g => g.id === selectedVehicle.garageId)?.storageName} 位置 {selectedVehicle.vehicleIndex + 1}
                  </p>
                </div>
                <div className={styles.swapArrow}>↔️</div>
                <div className={styles.swapVehicle}>
                  <h5>目标车辆：</h5>
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