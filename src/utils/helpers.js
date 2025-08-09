import dayjs from 'dayjs';
import { CURRENCY_SYMBOLS, EXPENSE_CATEGORIES } from './constants';

export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${Number(amount).toFixed(2)}`;
};

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  return dayjs(date).format(format);
};

export const getRelativeDate = (date) => {
  const today = dayjs();
  const inputDate = dayjs(date);
  
  if (inputDate.isSame(today, 'day')) {
    return 'Today';
  } else if (inputDate.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else if (inputDate.isAfter(today.subtract(7, 'day'))) {
    return inputDate.format('dddd');
  } else {
    return inputDate.format('MMM DD');
  }
};

export const getCategoryInfo = (categoryValue) => {
  return EXPENSE_CATEGORIES.find(cat => cat.value === categoryValue) || EXPENSE_CATEGORIES[8];
};

export const calculateDailyAverage = (expenses, days = 30) => {
  const recentExpenses = expenses.filter(expense => 
    dayjs(expense.date).isAfter(dayjs().subtract(days, 'day'))
  );
  
  const total = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  return total / days;
};

export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
};

export const generateExpenseReport = (expenses, startDate, endDate) => {
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = dayjs(expense.date);
    return expenseDate.isAfter(startDate) && expenseDate.isBefore(endDate);
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryGroups = groupExpensesByCategory(filteredExpenses);
  
  const categoryTotals = Object.entries(categoryGroups).map(([category, expenses]) => ({
    category,
    total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    count: expenses.length,
    percentage: ((expenses.reduce((sum, expense) => sum + expense.amount, 0) / totalAmount) * 100).toFixed(1)
  }));

  return {
    totalAmount,
    totalExpenses: filteredExpenses.length,
    categoryTotals,
    dailyAverage: totalAmount / dayjs(endDate).diff(dayjs(startDate), 'day')
  };
};

export const validateExpenseForm = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 50) {
    errors.title = 'Title must be 50 characters or less';
  }

  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (data.amount > 999999) {
    errors.amount = 'Amount is too large';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};