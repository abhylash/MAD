import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserExpenses, addExpense, updateExpense, deleteExpense } from '../firebase/firestore';
import { toast } from 'react-toastify';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userExpenses = await getUserExpenses(user.uid);
      setExpenses(userExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const addNewExpense = async (expenseData) => {
    if (!user) return;

    try {
      setLoading(true);
      const expenseId = await addExpense(user.uid, expenseData);
      const newExpense = { id: expenseId, ...expenseData };
      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Expense added successfully!');
      return expenseId;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateExistingExpense = async (expenseId, updateData) => {
    if (!user) return;

    try {
      await updateExpense(user.uid, expenseId, updateData);
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === expenseId 
            ? { ...expense, ...updateData }
            : expense
        )
      );
      toast.success('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
      throw error;
    }
  };

  const removeExpense = async (expenseId) => {
    if (!user) return;

    try {
      await deleteExpense(user.uid, expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  const value = {
    expenses,
    loading,
    addNewExpense,
    updateExistingExpense,
    removeExpense,
    refreshExpenses: fetchExpenses
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};