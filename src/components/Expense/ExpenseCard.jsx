import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatCurrency, formatDate, getCategoryInfo } from '../../utils/helpers';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const categoryInfo = getCategoryInfo(expense.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{categoryInfo.icon}</span>
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {expense.title}
            </h3>
          </div>
          
          <div className="flex items-center justify-between">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${categoryInfo.color}20`,
                color: categoryInfo.color
              }}
            >
              {categoryInfo.label}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(expense.date)}
            </span>
          </div>

          {expense.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
              {expense.notes}
            </p>
          )}
        </div>

        <div className="ml-4 text-right">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(expense.amount)}
          </div>
          
          <div className="flex space-x-1 mt-2">
            <button
              onClick={() => onEdit(expense)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseCard;