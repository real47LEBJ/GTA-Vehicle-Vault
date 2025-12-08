import React from 'react';
import { GarageVehicle } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { featureConfigMap } from '../../utils/features';

// 定义SwapVehicleDialog组件的属性接口
interface SwapVehicleDialogProps {
  isOpen: boolean; // 对话框是否打开
  currentVehicle: GarageVehicle | null; // 当前选中的载具
  targetVehicle: GarageVehicle | null; // 目标载具
  onClose: () => void; // 关闭对话框的回调
  onConfirmSwap: () => void; // 确认交换的回调
}

// SwapVehicleDialog组件实现
const SwapVehicleDialog: React.FC<SwapVehicleDialogProps> = ({
  isOpen,
  currentVehicle,
  targetVehicle,
  onClose,
  onConfirmSwap
}) => {
  // 如果对话框未打开或缺少必要的载具信息，不渲染任何内容
  if (!isOpen || !currentVehicle || !targetVehicle) {
    return null;
  }

  // 渲染特性徽章
  const renderFeatureBadge = (feature: string) => {
    const config = featureConfigMap[feature as keyof typeof featureConfigMap];
    if (!config) return null;
    return (
      <span
        key={feature}
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
        style={{ backgroundColor: config.bgColor, color: config.textColor }}
      >
        {feature}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">确认交换载具</h2>
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

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            您确定要交换以下两辆载具吗？
          </p>

          {/* 载具对比 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 当前选中的载具 */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">当前选中的载具</h3>
              <div className="space-y-2">
                <div>
                <p className="text-sm font-medium text-gray-600">名称</p>
                <p className="text-base text-gray-900">{currentVehicle.vehicleName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">品牌</p>
                <p className="text-base text-gray-900">{currentVehicle.brandName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">类型</p>
                <p className="text-base text-gray-900">{currentVehicle.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">价格</p>
                <p className="text-base text-gray-900">{formatPrice(currentVehicle.price)}</p>
              </div>
              {currentVehicle.feature && (
                <div>
                  <p className="text-sm font-medium text-gray-600">特性</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {renderFeatureBadge(currentVehicle.feature)}
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* 交换图标 */}
            <div className="flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>

            {/* 目标载具 */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">目标载具</h3>
              <div className="space-y-2">
                <div>
                <p className="text-sm font-medium text-gray-600">名称</p>
                <p className="text-base text-gray-900">{targetVehicle.vehicleName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">品牌</p>
                <p className="text-base text-gray-900">{targetVehicle.brandName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">类型</p>
                <p className="text-base text-gray-900">{targetVehicle.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">价格</p>
                <p className="text-base text-gray-900">{formatPrice(targetVehicle.price)}</p>
              </div>
              {targetVehicle.feature && (
                <div>
                  <p className="text-sm font-medium text-gray-600">特性</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {renderFeatureBadge(targetVehicle.feature)}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

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
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            onClick={onConfirmSwap}
          >
            确认交换
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapVehicleDialog;