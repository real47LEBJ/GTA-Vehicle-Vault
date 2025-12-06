import { useState } from 'react';
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
  icon: string;
};

function App() {
  // Simple routing
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Navigation items including About
  const navItems: NavItem[] = [
    { id: 'home', label: '载具管理', icon: '🏠' },
    { id: 'vehicleList', label: '载具购买', icon: '🚗' },
    { id: 'about', label: '关于', icon: 'ℹ️' },
  ];

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'vehicleList':
        return <AddPage />;
      default:
        return <HomePage />;
    }
  };

  return (
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
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Button>
        ))}
      </nav>

      {/* Main Content - No sidebar */}
      <main className={styles.mainContent}>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;
