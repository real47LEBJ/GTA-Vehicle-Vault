import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

function useTheme(): {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} {
  // 获取系统主题偏好
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 从localStorage获取保存的主题设置
  const getSavedTheme = (): Theme => {
    if (typeof window === 'undefined') {
      return 'system';
    }
    const saved = window.localStorage.getItem('theme') as Theme;
    return saved || 'system';
  };

  // 状态管理
  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const saved = getSavedTheme();
    return saved === 'system' ? getSystemTheme() : saved;
  });

  // 更新主题
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    const finalTheme = newTheme === 'system' ? getSystemTheme() : newTheme;
    setCurrentTheme(finalTheme);
    
    // 保存到localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', newTheme);
      
      // 更新HTML根元素的class
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(finalTheme);
    }
  };

  // 设置主题的函数
  const handleSetTheme = (newTheme: Theme) => {
    updateTheme(newTheme);
  };

  // 切换主题的函数
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 初始化主题
  useEffect(() => {
    updateTheme(theme);
  }, []);

  return {
    theme,
    currentTheme,
    setTheme: handleSetTheme,
    toggleTheme,
  };
}

export default useTheme;