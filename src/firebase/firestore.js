import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  getDoc
} from 'firebase/firestore';
import { db } from './config';

export const addExpense = async (userId, expenseData) => {
  try {
    const expenseRef = await addDoc(
      collection(db, 'users', userId, 'expenses'), 
      {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
    return expenseRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getUserExpenses = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'expenses'),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const updateExpense = async (userId, expenseId, updateData) => {
  try {
    const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (userId, expenseId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'expenses', expenseId));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const getUserBudgets = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'budgets'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

export const updateBudget = async (userId, category, amount) => {
  try {
    const budgetRef = doc(db, 'users', userId, 'budgets', category);
    await updateDoc(budgetRef, {
      amount,
      category,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};