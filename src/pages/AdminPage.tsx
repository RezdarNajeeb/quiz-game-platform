import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      <div className="fixed top-4 right-4 z-30">
        <Link
          to="/"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 backdrop-blur-sm"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">{t('backToGame')}</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>
      <AdminPanel />
    </div>
  );
};

export default AdminPage;