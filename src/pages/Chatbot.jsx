import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageCircle, FiUser } from 'react-icons/fi';
import { useExpenses } from '../context/ExpenseContext';
import { getFinancialAdvice, generateSpendingInsights } from '../utils/geminiApi';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your SmartSpendr AI assistant. I can help you analyze your spending, create budgets, and provide financial advice. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { expenses } = useExpenses();

  const quickQuestions = [
    "How can I save money?",
    "Analyze my spending patterns",
    "What's my biggest expense category?",
    "Give me budget recommendations",
    "How much do I spend on food?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    addMessage('user', userMessage);
    setInputValue('');
    setLoading(true);

    try {
      // Generate contextual insights for common queries
      let response;
      
      if (userMessage.toLowerCase().includes('spending') || 
          userMessage.toLowerCase().includes('pattern') ||
          userMessage.toLowerCase().includes('analyze')) {
        const insights = generateSpendingInsights(expenses);
        response = `Based on your spending data: ${insights}\n\nWould you like specific advice on any category or time period?`;
      } else {
        response = await getFinancialAdvice(userMessage, expenses);
      }
      
      addMessage('bot', response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage('bot', "I'm sorry, I'm having trouble processing your request right now. Please try again or ask a different question.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Financial Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Get personalized financial advice and spending insights
          </p>
        </div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {message.type === 'user' ? <FiUser size={16} /> : <FiMessageCircle size={16} />}
                    </div>
                    
                    <div className={`rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="whitespace-pre-line">{message.content}</p>
                      <span className={`text-xs mt-2 block opacity-70 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <FiMessageCircle size={16} />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <LoadingSpinner size="sm" text="Thinking..." />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your finances..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                variant="primary"
                disabled={!inputValue.trim() || loading}
                icon={<FiSend />}
                className="self-end"
              >
                Send
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Questions
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <FiMessageCircle className="text-blue-600 mt-1" size={20} />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                AI-Powered Financial Insights
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This assistant analyzes your spending data to provide personalized advice. 
                The more expenses you track, the better the insights become!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Chatbot;