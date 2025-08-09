import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiPlus, 
  FiBarChart, 
  FiMessageSquare, 
  FiSettings,
  FiTrendingUp 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/add-expense', icon: FiPlus, label: 'Add Expense' },
    { path: '/reports', icon: FiBarChart, label: 'Reports' },
    { path: '/analytics', icon: FiTrendingUp, label: 'Analytics' },
    { path: '/chatbot', icon: FiMessageSquare, label: 'AI Assistant' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 shadow-lg z-50 lg:translate-x-0 lg:static lg:z-auto"
      >
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </motion.nav>
    </>
  );
};

export default Sidebar;