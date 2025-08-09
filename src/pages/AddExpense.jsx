import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useExpenses } from '../context/ExpenseContext';
import ExpenseForm from '../components/Expense/ExpenseForm';

const AddExpense = () => {
  const { addNewExpense } = useExpenses();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (expenseData) => {
    try {
      setLoading(true);
      await addNewExpense(expenseData);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Expense
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your spending and stay on budget
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <ExpenseForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Pro Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use descriptive titles to easily identify expenses later</li>
            <li>• Select the most appropriate category for better insights</li>
            <li>• Add notes for important details you might forget</li>
            <li>• Track small expenses too - they add up quickly!</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AddExpense;