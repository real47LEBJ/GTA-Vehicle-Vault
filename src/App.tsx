import { useState, useCallback, useRef, createContext } from 'react';
import styles from './App.module.css';

// Import components
import Button from './components/Button';

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
  refreshHomePage: () => {}
});

function App() {
  // Simple routing
  const [currentPage, setCurrentPage] = useState<string>('home');
  
  // Create a ref to store page refresh triggers
  const refreshTriggers = useRef({
    home: 0
  });

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
