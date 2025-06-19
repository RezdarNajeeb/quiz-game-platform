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
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>{t('backToGame')}</span>
        </Link>
      </div>
      <AdminPanel />
    </div>
  );
};

export default AdminPage;