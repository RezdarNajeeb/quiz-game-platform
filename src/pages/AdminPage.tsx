import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState(() => getGameSettings());
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for storage changes to update language in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = getGameSettings();
      setSettings(newSettings);
      setRefreshKey(prev => prev + 1); // Force re-render
    };

    // Listen for both storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleSettingsUpdate = () => {
      handleStorageChange();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    // Polling fallback to ensure we catch any missed updates
    const interval = setInterval(() => {
      const currentSettings = getGameSettings();
      if (currentSettings.language !== settings.language || 
          currentSettings.adminPassword !== settings.adminPassword || 
          currentSettings.timerDuration !== settings.timerDuration) {
        setSettings(currentSettings);
        setRefreshKey(prev => prev + 1);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      clearInterval(interval);
    };
  }, [settings]);

  const t = (key: string) => getTranslation(key, settings.language);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div key={refreshKey} dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="flex items-center justify-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-3 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] sm:min-w-auto"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="hidden sm:inline">{t('backToGame')}</span>
        </Link>
      </div>
      <AdminPanel key={`panel-${refreshKey}`} />
    </div>
  );
};

export default AdminPage;