import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, groupExpensesByCategory, calculateDailyAverage } from '../utils/helpers';
import { CHART_COLORS } from '../utils/constants';
import BarChart from '../components/Charts/BarChart';
import PieChart from '../components/Charts/PieChart';
import ExpenseCard from '../components/Expense/ExpenseCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import dayjs from 'dayjs';

const Dashboard = () => {
  const { expenses, loading, removeExpense } = useExpenses();

  const dashboardData = useMemo(() => {
    const today = dayjs();
    const thisMonth = expenses.filter(exp => dayjs(exp.date).isSame(today, 'month'));
    const thisWeek = expenses.filter(exp => dayjs(exp.date).isSame(today, 'week'));
    const todayExpenses = expenses.filter(exp => dayjs(exp.date).isSame(today, 'day'));

    const totalThisMonth = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);
    const totalThisWeek = thisWeek.reduce((sum, exp) => sum + exp.amount, 0);
    const totalToday = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const dailyAverage = calculateDailyAverage(expenses);

    // Category breakdown for pie chart
    const categoryGroups = groupExpensesByCategory(thisMonth);
    const categoryData = Object.entries(categoryGroups).map(([category, expenseList]) => ({
      category,
      total: expenseList.reduce((sum, exp) => sum + exp.amount, 0),
      count: expenseList.length
    }));

    // Weekly trend for bar chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = today.subtract(6 - i, 'day');
      const dayExpenses = expenses.filter(exp => dayjs(exp.date).isSame(date, 'day'));
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        date: date.format('ddd'),
        amount: total
      };
    });

    return {
      totalThisMonth,
      totalThisWeek,
      totalToday,
      dailyAverage,
      categoryData,
      last7Days,
      recentExpenses: expenses.slice(0, 5)
    };
  }, [expenses]);

  const weeklyChartData = {
    labels: dashboardData.last7Days.map(d => d.date),
    datasets: [
      {
        label: 'Daily Spending',
        data: dashboardData.last7Days.map(d => d.amount),
        backgroundColor: CHART_COLORS[0],
        borderColor: CHART_COLORS[0],
        borderWidth: 2,
      }
    ]
  };

  const categoryChartData = {
    labels: dashboardData.categoryData.map(cat => cat.category),
    datasets: [
      {
        data: dashboardData.categoryData.map(cat => cat.total),
        backgroundColor: CHART_COLORS.slice(0, dashboardData.categoryData.length),
        borderWidth: 2,
      }
    ]
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your spending and financial goals
          </p>
        </div>
        
        <Link to="/add-expense">
          <Button variant="primary" icon={<FiPlus />}>
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiDollarSign className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.totalToday)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiCalendar className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.totalThisWeek)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FiTrendingUp className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.totalThisMonth)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FiDollarSign className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Avg</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardData.dailyAverage)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            7-Day Spending Trend
          </h3>
          {dashboardData.last7Days.length > 0 ? (
            <BarChart data={weeklyChartData} height={250} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Breakdown (This Month)
          </h3>
          {dashboardData.categoryData.length > 0 ? (
            <PieChart data={categoryChartData} height={250} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Expenses
          </h3>
          <Link
            to="/reports"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {dashboardData.recentExpenses.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => {}}
                onDelete={removeExpense}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No expenses yet. Start tracking your spending!
            </p>
            <Link to="/add-expense">
              <Button variant="primary" icon={<FiPlus />}>
                Add Your First Expense
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;