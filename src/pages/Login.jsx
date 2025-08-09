

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Login = () => {
  const { user, login, loading } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner size="lg" text="Loading SmartSpendr..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo and Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mx-auto h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8"
          >
            <FiDollarSign size={40} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            SmartSpendr
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            AI-powered expense tracking and financial insights
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
        >
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Track expenses with AI insights</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Beautiful analytics and reports</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Smart budgeting and goals</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Works offline as a PWA</span>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            variant="primary"
            size="lg"
            loading={loginLoading}
            className="w-full"
          >
            Sign in with Google
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Secure authentication powered by Firebase
          </p>
        </motion.div>

        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              <strong>🚀 Setup Required:</strong> To use this app, you need to configure Firebase.
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Please check the <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">FIREBASE_SETUP.md</code> file 
              for step-by-step instructions to set up your Firebase project.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;