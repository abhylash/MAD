import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { EXPENSE_CATEGORIES, QUICK_AMOUNTS } from '../../utils/constants';
import { validateExpenseForm } from '../../utils/helpers';
import Button from '../UI/Button';

const ExpenseForm = ({ onSubmit, initialData = null, loading = false }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      category: '',
      date: dayjs().format('YYYY-MM-DD'),
      notes: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || '',
        date: dayjs(initialData.date).format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
        notes: initialData.notes || ''
      });
    }
  }, [initialData, reset]);

  const handleQuickAmount = (amount) => {
    setSelectedAmount(amount);
    setValue('amount', amount);
  };

  const onFormSubmit = (data) => {
    const validation = validateExpenseForm(data);
    if (validation.isValid) {
      onSubmit({
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date)
      });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expense Title *
        </label>
        <input
          {...register('title', { 
            required: 'Title is required',
            maxLength: { value: 50, message: 'Title must be 50 characters or less' }
          })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Lunch at restaurant"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Amount with Quick Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount *
        </label>
        
        {/* Quick amount buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleQuickAmount(amount)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedAmount === amount
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        <input
          {...register('amount', { 
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' }
          })}
          type="number"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category *
        </label>
        <select
          {...register('category', { required: 'Category is required' })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select a category</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.icon} {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date *
        </label>
        <input
          {...register('date', { required: 'Date is required' })}
          type="date"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Additional notes about this expense..."
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {initialData ? 'Update Expense' : 'Add Expense'}
      </Button>
    </motion.form>
  );
};

export default ExpenseForm;