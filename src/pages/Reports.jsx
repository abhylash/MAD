import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFilter, FiBarChart } from 'react-icons/fi';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, generateExpenseReport, getCategoryInfo } from '../utils/helpers';
import { CHART_COLORS } from '../utils/constants';
import BarChart from '../components/Charts/BarChart';
import PieChart from '../components/Charts/PieChart';
import LineChart from '../components/Charts/LineChart';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import dayjs from 'dayjs';

const Reports = () => {
  const { expenses, loading } = useExpenses();
  const [dateRange, setDateRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const reportData = useMemo(() => {
    let filteredExpenses = expenses;
    const now = dayjs();

    // Filter by date range
    switch (dateRange) {
      case 'week':
        filteredExpenses = expenses.filter(exp => 
          dayjs(exp.date).isAfter(now.subtract(1, 'week'))
        );
        break;
      case 'month':
        filteredExpenses = expenses.filter(exp => 
          dayjs(exp.date).isAfter(now.subtract(1, 'month'))
        );
        break;
      case 'quarter':
        filteredExpenses = expenses.filter(exp => 
          dayjs(exp.date).isAfter(now.subtract(3, 'month'))
        );
        break;
      case 'year':
        filteredExpenses = expenses.filter(exp => 
          dayjs(exp.date).isAfter(now.subtract(1, 'year'))
        );
        break;
      default:
        break;
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === selectedCategory);
    }

    const startDate = dayjs().subtract(1, dateRange === 'week' ? 'week' : 
                                     dateRange === 'month' ? 'month' :
                                     dateRange === 'quarter' ? 'month' :
                                     'year');
    const endDate = dayjs();

    return generateExpenseReport(filteredExpenses, startDate, endDate);
  }, [expenses, dateRange, selectedCategory]);

  const chartData = useMemo(() => {
    const categoryTotals = reportData.categoryTotals;
    
    const pieData = {
      labels: categoryTotals.map(cat => getCategoryInfo(cat.category).label),
      datasets: [{
        data: categoryTotals.map(cat => cat.total),
        backgroundColor: CHART_COLORS.slice(0, categoryTotals.length),
        borderWidth: 2,
      }]
    };

    const barData = {
      labels: categoryTotals.map(cat => getCategoryInfo(cat.category).label),
      datasets: [{
        label: 'Amount Spent',
        data: categoryTotals.map(cat => cat.total),
        backgroundColor: CHART_COLORS[0],
        borderColor: CHART_COLORS[0],
        borderWidth: 2,
      }]
    };

    // Monthly trend data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = dayjs().subtract(11 - i, 'month');
      const monthExpenses = expenses.filter(exp => 
        dayjs(exp.date).isSame(month, 'month')
      );
      return {
        month: month.format('MMM'),
        total: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      };
    });

    const lineData = {
      labels: monthlyData.map(d => d.month),
      datasets: [{
        label: 'Monthly Spending',
        data: monthlyData.map(d => d.total),
        borderColor: CHART_COLORS[0],
        backgroundColor: `${CHART_COLORS[0]}20`,
        fill: true,
      }]
    };

    return { pieData, barData, lineData };
  }, [reportData, expenses]);

  const exportToCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Notes'];
    const csvData = expenses.map(exp => [
      dayjs(exp.date).format('YYYY-MM-DD'),
      exp.title,
      getCategoryInfo(exp.category).label,
      exp.amount,
      exp.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }

  const categories = [...new Set(expenses.map(exp => exp.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed insights into your spending patterns
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <Button
            variant="outline"
            icon={<FiDownload />}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-4 mb-4">
          <FiBarChart className="text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filters</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryInfo(category).label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {formatCurrency(reportData.totalAmount)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {reportData.totalExpenses}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {formatCurrency(reportData.dailyAverage)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Spending by Category
          </h3>
          {reportData.categoryTotals.length > 0 ? (
            <PieChart data={chartData.pieData} height={300} />
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              No data available for selected filters
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Comparison
          </h3>
          {reportData.categoryTotals.length > 0 ? (
            <BarChart data={chartData.barData} height={300} />
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              No data available for selected filters
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          12-Month Spending Trend
        </h3>
        <LineChart data={chartData.lineData} height={350} />
      </motion.div>

      {/* Category Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Breakdown
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</th>
                <th className="pb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.categoryTotals.map((category, index) => {
                const categoryInfo = getCategoryInfo(category.category);
                return (
                  <tr key={category.category}>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{categoryInfo.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {categoryInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-gray-900 dark:text-white">
                      {formatCurrency(category.total)}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">
                      {category.count}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${category.percentage}%`,
                              backgroundColor: categoryInfo.color
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;