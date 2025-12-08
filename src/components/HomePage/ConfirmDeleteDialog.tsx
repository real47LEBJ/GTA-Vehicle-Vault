import React, { useEffect } from 'react';

// 定义ConfirmDeleteDialog组件的属性接口
interface ConfirmDeleteDialogProps {
  isOpen: boolean; // 对话框是否打开
  title: string; // 对话框标题
  message: string; // 确认消息
  onClose: () => void; // 关闭对话框的回调
  onConfirm: () => void; // 确认删除的回调
}

// ConfirmDeleteDialog组件实现
const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm
}) => {
  // 处理键盘事件，按下ESC键关闭对话框
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // 添加事件监听器
    window.addEventListener('keydown', handleEscKey);
    // 移除事件监听器
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  // 如果对话框未打开，不渲染任何内容
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
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
          <p className="text-gray-700">{message}</p>
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
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={onConfirm}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;