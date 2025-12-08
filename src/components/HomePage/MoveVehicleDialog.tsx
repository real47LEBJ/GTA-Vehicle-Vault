import React, { useState, useEffect } from 'react';
import { Garage, GarageVehicle } from '../../types';

// 定义MoveVehicleDialog组件的属性接口
interface MoveVehicleDialogProps {
  isOpen: boolean; // 对话框是否打开
  vehicle: GarageVehicle | null; // 要移动的车辆
  garages: Garage[]; // 所有车库列表
  onClose: () => void; // 关闭对话框的回调
  onSelectGarage: (garageId: string) => void; // 选择目标车库的回调
}

// MoveVehicleDialog组件实现
const MoveVehicleDialog: React.FC<MoveVehicleDialogProps> = ({
  isOpen,
  vehicle,
  garages,
  onClose,
  onSelectGarage
}) => {
  const [selectedGarageId, setSelectedGarageId] = useState<string>('');

  // 当对话框关闭时，重置选中的车库
  useEffect(() => {
    if (!isOpen) {
      setSelectedGarageId('');
    }
  }, [isOpen]);

  // 如果对话框未打开，不渲染任何内容
  if (!isOpen || !vehicle) {
    return null;
  }

  // 过滤出未满的车库
  const availableGarages = garages.filter(garage => 
    garage.vehicleList.length < garage.num
  );

  // 处理移动按钮点击事件
  const handleMove = () => {
    if (selectedGarageId) {
      onSelectGarage(selectedGarageId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">移动载具</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 显示要移动的载具信息 */}
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="text-lg font-medium text-gray-800">{vehicle.vehicleName}</h3>
          <p className="text-sm text-gray-600">{vehicle.brandName} - {vehicle.vehicle_type}</p>
        </div>

        {/* 目标车库选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择目标车库</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedGarageId}
            onChange={(e) => setSelectedGarageId(e.target.value)}
          >
            <option value="">请选择车库</option>
            {availableGarages.map((garage) => (
              <option key={garage.id} value={garage.id}>
                {garage.storageName} ({garage.vehicleList.length}/{garage.num})
              </option>
            ))}
          </select>
        </div>

        {/* 如果没有可用车库 */}
        {availableGarages.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-200 rounded text-yellow-700">
            <p>没有可用的目标车库。请确保其他车库未满。</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleMove}
            disabled={!selectedGarageId || availableGarages.length === 0}
          >
            移动
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveVehicleDialog;