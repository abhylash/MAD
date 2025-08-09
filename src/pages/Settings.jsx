import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiBell, FiSun, FiDownload, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    budgetAlerts: true,
    weeklyReport: false,
    spendingAlerts: true
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    // In a real app, this would delete the user account
    console.log('Delete account requested');
    setDeleteModalOpen(false);
    logout();
  };

  const exportData = () => {
    // Export user data functionality
    console.log('Exporting user data');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <FiUser className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Profile
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <FiUser size={24} className="text-gray-500" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {user?.displayName || 'User'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <FiSun className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Appearance
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Dark Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <FiBell className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'dailyReminder',
              title: 'Daily Expense Reminder',
              description: 'Get reminded to log your daily expenses'
            },
            {
              key: 'budgetAlerts',
              title: 'Budget Alerts',
              description: 'Notifications when approaching budget limits'
            },
            {
              key: 'weeklyReport',
              title: 'Weekly Summary',
              description: 'Weekly spending summary reports'
            },
            {
              key: 'spendingAlerts',
              title: 'Spending Pattern Alerts',
              description: 'Alerts for unusual spending patterns'
            }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {setting.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {setting.description}
                </p>
              </div>
              
              <button
                onClick={() => handleNotificationChange(setting.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notifications[setting.key] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[setting.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <FiDownload className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Data Management
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Export Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download all your expense data
              </p>
            </div>
            <Button variant="outline" onClick={exportData}>
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
            <Button 
              variant="danger" 
              onClick={() => setDeleteModalOpen(true)}
              icon={<FiTrash2 />}
            >
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
          </p>
          
          <div className="flex space-x-4 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;