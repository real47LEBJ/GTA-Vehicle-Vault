import { useState, useCallback, useRef, createContext, useEffect } from 'react';
import styles from './App.module.css';

// Import components
import Button from './components/Button';

// Import API
import { getDataInfo } from './utils/api';

// Import pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddPage from './pages/AddPage';

// Navigation item type
type NavItem = {
  id: string;
  label: string;
};

// Create a context for refresh functions
export const RefreshContext = createContext<{
  refreshHomePage: () => void;
}>({
  refreshHomePage: () => { }
});

function App() {
  // Simple routing
  const [currentPage, setCurrentPage] = useState<string>('home');
  // Data info state
  const [dataInfo, setDataInfo] = useState<any>(null);

  // Create a ref to store page refresh triggers
  const refreshTriggers = useRef({
    home: 0
  });

  // Fetch data info on component mount
  useEffect(() => {
    const fetchDataInfo = async () => {
      const response = await getDataInfo();
      if (response.success && response.data) {
        setDataInfo(response.data);
      }
    };

    fetchDataInfo();
  }, []);

  // Navigation items including About
  const navItems: NavItem[] = [
    { id: 'home', label: '载具管理' },
    { id: 'vehicleList', label: '载具添加' },
    { id: 'about', label: '关于' }
  ];

  // Function to trigger HomePage refresh (can be called when garage_overview changes)
  const refreshHomePage = useCallback(() => {
    refreshTriggers.current.home += 1;
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshHomePage }}>
      <div className={styles.app}>
        <nav className={styles.appNav}>
          <div className={styles.appNavCenter}>
            {navItems.map((item) => (
              <Button
                className={styles.navButton}
                key={item.id}
                variant={currentPage === item.id ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setCurrentPage(item.id)}
              >
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
          <div className={styles.appInfo}>
            <div>数据更新至：<span style={{ color: '#ffffff', fontSize: '15px' }}>{dataInfo?.dlc_name || ''}</span></div>
            {dataInfo?.update_time && (
              <div>数据更新时间：<span style={{ color: '#ffffff', fontSize: '15px' }}>{dataInfo.update_time.substring(0, 10)}</span></div>
            )}
            <div>v1.0.0</div>
          </div>
        </nav>

        {/* Main Content - No sidebar */}
        <main className={styles.mainContent}>
          {/* Keep all pages rendered but show/hide based on currentPage */}
          <HomePage
            key={refreshTriggers.current.home} // Only refresh when explicitly triggered
            className={currentPage === 'home' ? styles.pageVisible : styles.pageHidden}
          />
          <AddPage
            className={currentPage === 'vehicleList' ? styles.pageVisible : styles.pageHidden}
          />
          <AboutPage
            className={currentPage === 'about' ? styles.pageVisible : styles.pageHidden}
          />
        </main>
      </div>
    </RefreshContext.Provider>
  );
}

export default App;
