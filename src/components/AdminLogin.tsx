import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { getGameSettings } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const settings = getGameSettings();
  const t = (key: string) => getTranslation(key, settings.language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === settings.adminPassword) {
      onLogin();
    } else {
      setError(t('incorrectPassword'));
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-sm sm:max-w-md mx-4">
        <div className="text-center mb-8">
          <Lock size={40} className="mx-auto text-gray-600 mb-4 sm:w-12 sm:h-12" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('adminAccess')}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('enterAdminPassword')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder={t('enterPassword')}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition-colors duration-200 text-sm sm:text-base"
          >
            {t('login')}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
          {t('defaultPassword')}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;