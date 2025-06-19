import React, { useState, useEffect } from 'react';
import { User, Question, GameSettings } from '../types/game';
import { getGameState, saveGameState, getGameSettings, saveGameSettings, resetGameRound } from '../utils/storage';
import { getTranslation } from '../utils/translations';
import { Users, HelpCircle, Settings, BarChart3, Plus, Edit, Trash2, Save, X, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Globe } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'settings' | 'status'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<GameSettings>({ timerDuration: 60, adminPassword: 'admin123', language: 'en' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const t = (key: string) => getTranslation(key, settings.language);

  useEffect(() => {
    const gameState = getGameState();
    const gameSettings = getGameSettings();
    setUsers(gameState.users);
    setQuestions(gameState.questions);
    setSettings(gameSettings);
  }, []);

  const showSaveStatus = (status: 'success' | 'error', message: string) => {
    setSaveStatus(status);
    setSaveMessage(message);
    setTimeout(() => {
      setSaveStatus('idle');
      setSaveMessage('');
    }, 3000);
  };

  const saveData = async () => {
    try {
      setSaveStatus('saving');
      const gameState = getGameState();
      saveGameState({ ...gameState, users, questions });
      saveGameSettings(settings);
      showSaveStatus('success', t('changesSavedSuccessfully'));
    } catch (error) {
      console.error('Error saving data:', error);
      showSaveStatus('error', t('failedToSaveChanges'));
    }
  };

  const addUser = () => {
    if (!newUserName.trim()) return;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      hasPlayedThisRound: false,
    };
    setUsers([...users, newUser]);
    setNewUserName('');
  };

  const updateUser = (updatedUser: User) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditingUser(null);
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, hasPlayedThisRound: !user.hasPlayedThisRound }
        : user
    ));
  };

  const addQuestion = () => {
    if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) return;
    const question: Question = {
      id: `q-${Date.now()}`,
      question: newQuestion.question.trim(),
      options: newQuestion.options.map(opt => opt.trim()),
      correctAnswer: newQuestion.correctAnswer,
      usedThisRound: false,
    };
    setQuestions([...questions, question]);
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const toggleQuestionStatus = (questionId: string) => {
    setQuestions(questions.map(question => 
      question.id === questionId 
        ? { ...question, usedThisRound: !question.usedThisRound }
        : question
    ));
  };

  const tabs = [
    { id: 'users' as const, label: t('users'), icon: Users },
    { id: 'questions' as const, label: t('questions'), icon: HelpCircle },
    { id: 'settings' as const, label: t('settings'), icon: Settings },
    { id: 'status' as const, label: t('gameStatus'), icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={settings.language === 'ckb' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('quizGameAdminPanel')}</h1>
          </div>

          {/* Save Status Notification */}
          {saveStatus !== 'idle' && (
            <div className={`mx-4 sm:mx-6 mt-4 p-4 rounded-lg flex items-center space-x-3 ${
              saveStatus === 'success' ? 'bg-green-50 border border-green-200' :
              saveStatus === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {saveStatus === 'saving' && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">{t('savingChanges')}</span>
                </>
              )}
              {saveStatus === 'success' && (
                <>
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-green-800 font-medium">{saveMessage}</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-red-800 font-medium">{saveMessage}</span>
                </>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-4 px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'users' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-semibold">{t('userManagement')}</h2>
                  <button
                    onClick={saveData}
                    disabled={saveStatus === 'saving'}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 sm:px-4 py-2 rounded-md flex items-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base"
                  >
                    <Save size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{saveStatus === 'saving' ? t('saving') : t('saveChanges')}</span>
                    <span className="sm:hidden">{saveStatus === 'saving' ? t('saving') : 'Save'}</span>
                  </button>
                </div>

                {/* Add User */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 text-sm sm:text-base">{t('addNewUser')}</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder={t('enterUserName')}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      onKeyPress={(e) => e.key === 'Enter' && addUser()}
                    />
                    <button
                      onClick={addUser}
                      disabled={!newUserName.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base"
                    >
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                      <span>{t('add')}</span>
                    </button>
                  </div>
                </div>

                {/* Users List */}
                <div className="space-y-2 sm:space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg space-y-2 sm:space-y-0">
                      {editingUser?.id === user.id ? (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1">
                          <input
                            type="text"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            onKeyPress={(e) => e.key === 'Enter' && updateUser(editingUser)}
                          />
                          
                          {/* Status Toggle in Edit Mode */}
                          <div className="flex items-center space-x-2 justify-center sm:justify-start">
                            <span className="text-xs sm:text-sm text-gray-600">{t('status')}:</span>
                            <button
                              onClick={() => setEditingUser({ 
                                ...editingUser, 
                                hasPlayedThisRound: !editingUser.hasPlayedThisRound 
                              })}
                              className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                editingUser.hasPlayedThisRound 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {editingUser.hasPlayedThisRound ? (
                                <>
                                  <ToggleRight size={14} />
                                  <span>{t('played')}</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={14} />
                                  <span>{t('available')}</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex space-x-2 justify-center sm:justify-start">
                            <button
                              onClick={() => updateUser(editingUser)}
                              disabled={!editingUser.name.trim()}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md transition-colors"
                            >
                              <Save size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors"
                            >
                              <X size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <span className="font-medium text-sm sm:text-base break-words">{user.name}</span>
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors self-start sm:self-auto ${
                                user.hasPlayedThisRound 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {user.hasPlayedThisRound ? (
                                <>
                                  <ToggleRight size={12} />
                                  <span>{t('played')}</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={12} />
                                  <span>{t('available')}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                              title={t('editUser')}
                            >
                              <Edit size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                              title={t('deleteUser')}
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-semibold">{t('questionManagement')}</h2>
                  <button
                    onClick={saveData}
                    disabled={saveStatus === 'saving'}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 sm:px-4 py-2 rounded-md flex items-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base"
                  >
                    <Save size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{saveStatus === 'saving' ? t('saving') : t('saveChanges')}</span>
                    <span className="sm:hidden">{saveStatus === 'saving' ? t('saving') : 'Save'}</span>
                  </button>
                </div>

                {/* Add Question */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3 text-sm sm:text-base">{t('addNewQuestion')}</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      placeholder={t('enterQuestion')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={newQuestion.correctAnswer === index}
                          onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addQuestion}
                      disabled={!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                      <span>{t('addQuestion')}</span>
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {questions.map(question => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      {editingQuestion?.id === question.id ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-lg">{t('editQuestion')}</h4>
                            <div className="flex items-center space-x-2">
                              {/* Status Toggle in Edit Mode */}
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{t('status')}:</span>
                                <button
                                  onClick={() => setEditingQuestion({ 
                                    ...editingQuestion, 
                                    usedThisRound: !editingQuestion.usedThisRound 
                                  })}
                                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    editingQuestion.usedThisRound 
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  {editingQuestion.usedThisRound ? (
                                    <>
                                      <ToggleRight size={14} />
                                      <span>{t('used')}</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft size={14} />
                                      <span>{t('available')}</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <button
                                onClick={() => updateQuestion(editingQuestion)}
                                disabled={!editingQuestion.question.trim() || editingQuestion.options.some(opt => !opt.trim())}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md transition-colors"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => setEditingQuestion(null)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <input
                            type="text"
                            value={editingQuestion.question}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('questionText')}
                          />
                          
                          <div className="space-y-2">
                            {editingQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name={`correctAnswer-${editingQuestion.id}`}
                                  checked={editingQuestion.correctAnswer === index}
                                  onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: index })}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...editingQuestion.options];
                                    newOptions[index] = e.target.value;
                                    setEditingQuestion({ ...editingQuestion, options: newOptions });
                                  }}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-lg">{question.question}</h4>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleQuestionStatus(question.id)}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  question.usedThisRound 
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                {question.usedThisRound ? (
                                  <>
                                    <ToggleRight size={12} />
                                    <span>{t('used')}</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft size={12} />
                                    <span>{t('available')}</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setEditingQuestion(question)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                title={t('editQuestion')}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteQuestion(question.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                title={t('deleteQuestion')}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((option, index) => (
                              <div key={index} className={`p-2 rounded text-sm ${
                                index === question.correctAnswer ? 'bg-green-100 text-green-800 font-medium' : 'bg-gray-100'
                              }`}>
                                {String.fromCharCode(65 + index)}. {option}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6 max-w-2xl">
                <h2 className="text-xl sm:text-2xl font-semibold">{t('gameSettings')}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      {t('timerDuration')}
                    </label>
                    <input
                      type="number"
                      value={settings.timerDuration}
                      onChange={(e) => setSettings({ ...settings, timerDuration: parseInt(e.target.value) || 60 })}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      min="10"
                      max="300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      {t('adminPassword')}
                    </label>
                    <input
                      type="password"
                      value={settings.adminPassword}
                      onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      <Globe size={14} className="inline mr-2 sm:w-4 sm:h-4" />
                      {t('language')}
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value as 'en' | 'ckb' })}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    >
                      <option value="en">{t('english')}</option>
                      <option value="ckb">{t('centralKurdish')}</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={saveData}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-md flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto text-sm sm:text-base"
                >
                  <Save size={16} className="sm:w-5 sm:h-5" />
                  <span>{saveStatus === 'saving' ? t('saving') : t('saveSettings')}</span>
                </button>
              </div>
            )}

            {activeTab === 'status' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold">{t('gameStatus')}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">{t('totalUsers')}</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{users.length}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">{t('usersPlayed')}</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {users.filter(u => u.hasPlayedThisRound).length}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 sm:p-6 rounded-lg sm:col-span-2 lg:col-span-1">
                    <h3 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">{t('questionsUsed')}</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {questions.filter(q => q.usedThisRound).length} / {questions.length}
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                  <h3 className="font-semibold text-red-800 mb-4 text-base sm:text-lg">{t('resetGameRound')}</h3>
                  <p className="text-red-700 mb-4 text-sm sm:text-base">
                    {t('resetGameRoundDescription')}
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("Are You Sure?")) {
                        resetGameRound();
                        window.history.back();
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition-colors w-full sm:w-auto text-sm sm:text-base"
                  >
                    {t('resetGameRound')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;