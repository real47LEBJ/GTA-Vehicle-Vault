import { useState, useEffect } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 获取初始值（从localStorage或使用默认值）
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 状态管理
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 更新函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许值是函数，类似于useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // 保存状态
      setStoredValue(valueToStore);

      // 保存到localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听其他窗口的变化
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    // 添加事件监听
    window.addEventListener('storage', handleStorageChange);

    // 清理事件监听
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
