import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'demo-key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const getFinancialAdvice = async (userQuery, expenseData = []) => {
  // Check if API key is available
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'demo-key') {
    return getFallbackResponse(userQuery);
  }

  try {
    const contextualData = generateContextualPrompt(userQuery, expenseData);
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: contextualData
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting financial advice:', error);
    return getFallbackResponse(userQuery);
  }
};

const generateContextualPrompt = (userQuery, expenseData) => {
  const recentExpenses = expenseData.slice(0, 10);
  const totalSpending = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = [...new Set(expenseData.map(expense => expense.category))];

  return `You are SmartSpendr AI, a personal financial advisor. Help the user with their expense management.

User Query: "${userQuery}"

User's Recent Financial Data:
- Total Expenses: $${totalSpending.toFixed(2)}
- Number of Transactions: ${expenseData.length}
- Categories: ${categories.join(', ')}
- Recent Expenses: ${recentExpenses.map(exp => `${exp.title}: $${exp.amount} (${exp.category})`).join(', ')}

Provide practical, personalized financial advice based on this data. Be concise, actionable, and supportive.`;
};

const getFallbackResponse = (userQuery) => {
  const fallbackResponses = {
    'save money': 'Here are some ways to save money: 1) Track all expenses daily 2) Set category budgets 3) Cook meals at home 4) Review subscriptions monthly 5) Use the 24-hour rule for non-essential purchases',
    'budget': 'For effective budgeting: Follow the 50/30/20 rule - 50% for needs, 30% for wants, 20% for savings. Set realistic category limits and review them monthly.',
    'analyze': 'Based on general patterns: Look for your largest expense categories, identify unnecessary recurring costs, and track daily spending trends to find optimization opportunities.',
    default: 'I can help you with budgeting, saving money, analyzing spending patterns, and creating financial goals. What specific aspect of your finances would you like to discuss?'
  };

  const lowerQuery = userQuery.toLowerCase();
  
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lowerQuery.includes(key)) {
      return response;
    }
  }
  
  return fallbackResponses.default;
};

export const generateSpendingInsights = (expenses) => {
  if (!expenses.length) return 'Start tracking expenses to get personalized insights!';

  const insights = [];
  const categoryTotals = {};
  let totalSpending = 0;

  expenses.forEach(expense => {
    const category = expense.category || 'other';
    categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    totalSpending += expense.amount;
  });

  // Find top spending category
  const topCategory = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topCategory) {
    const percentage = ((topCategory[1] / totalSpending) * 100).toFixed(0);
    insights.push(`Your highest spending category is ${topCategory[0]} (${percentage}% of total)`);
  }

  // Average daily spending
  const dailyAverage = totalSpending / 30;
  insights.push(`Your average daily spending is $${dailyAverage.toFixed(2)}`);

  // Recent trend
  const recentExpenses = expenses.slice(0, 7);
  const recentTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const weeklyAverage = recentTotal / 7;
  
  if (weeklyAverage > dailyAverage) {
    insights.push(`You've been spending ${(((weeklyAverage - dailyAverage) / dailyAverage) * 100).toFixed(0)}% more than usual this week`);
  } else {
    insights.push('Your spending has been stable this week. Great job staying on track!');
  }

  return insights.join('. ');
};