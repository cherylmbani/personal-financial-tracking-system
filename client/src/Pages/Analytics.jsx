import React, { useState, useEffect } from 'react';
import '../Styles/Analytics.css'

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5555/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError('Error loading transactions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const calculateAnalytics = () => {
    const currentDate = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
        break;
      default:
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    }

    const filteredTransactions = transactions.filter(transaction => 
      new Date(transaction.date) >= startDate
    );

    // Calculate totals
    const totalIncome = filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryBreakdown = {};
    filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + parseFloat(transaction.amount);
      });

    // Monthly trends
    const monthlyData = {};
    filteredTransactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      if (transaction.transaction_type === 'income') {
        monthlyData[month].income += parseFloat(transaction.amount);
      } else {
        monthlyData[month].expenses += parseFloat(transaction.amount);
      }
    });

    // Top expenses
    const topExpenses = filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5);

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      categoryBreakdown,
      monthlyData,
      topExpenses,
      transactionCount: filteredTransactions.length
    };
  };

  const analytics = calculateAnalytics();

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Financial Analytics</h1>
        <div className="time-range-selector">
          <label>Time Range: </label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="range-select"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card income-card">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h3>Total Income</h3>
            <p className="metric-value">${analytics.totalIncome.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card expense-card">
          <div className="metric-icon">💸</div>
          <div className="metric-info">
            <h3>Total Expenses</h3>
            <p className="metric-value">${analytics.totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card savings-card">
          <div className="metric-icon">📈</div>
          <div className="metric-info">
            <h3>Net Savings</h3>
            <p className="metric-value">${analytics.netSavings.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card rate-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-info">
            <h3>Savings Rate</h3>
            <p className="metric-value">{analytics.savingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        {/* Category Breakdown */}
        <div className="analytics-section">
          <h2>Spending by Category</h2>
          <div className="category-breakdown">
            {Object.entries(analytics.categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{category}</span>
                    <span className="category-amount">${amount.toFixed(2)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(amount / analytics.totalExpenses) * 100}%`,
                        backgroundColor: analytics.totalExpenses > 0 ? '#e74c3c' : '#bdc3c7'
                      }}
                    ></div>
                  </div>
                  <span className="category-percentage">
                    {analytics.totalExpenses > 0 ? 
                      `${((amount / analytics.totalExpenses) * 100).toFixed(1)}%` : '0%'
                    }
                  </span>
                </div>
              ))
            }
            {Object.keys(analytics.categoryBreakdown).length === 0 && (
              <p className="no-data">No expense data available</p>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="analytics-section">
          <h2>Income vs Expenses Trend</h2>
          <div className="trend-chart">
            {Object.entries(analytics.monthlyData)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .map(([month, data]) => (
                <div key={month} className="trend-item">
                  <div className="trend-month">{month}</div>
                  <div className="trend-bars">
                    <div className="income-bar-container">
                      <div 
                        className="income-bar"
                        style={{ 
                          height: `${(data.income / Math.max(analytics.totalIncome, 1)) * 100}%`,
                          backgroundColor: '#27ae60'
                        }}
                      ></div>
                      <span className="bar-label">${data.income.toFixed(0)}</span>
                    </div>
                    <div className="expense-bar-container">
                      <div 
                        className="expense-bar"
                        style={{ 
                          height: `${(data.expenses / Math.max(analytics.totalExpenses, 1)) * 100}%`,
                          backgroundColor: '#e74c3c'
                        }}
                      ></div>
                      <span className="bar-label">${data.expenses.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))
            }
            {Object.keys(analytics.monthlyData).length === 0 && (
              <p className="no-data">No trend data available</p>
            )}
          </div>
        </div>

        {/* Top Expenses */}
        <div className="analytics-section">
          <h2>Top Expenses</h2>
          <div className="top-expenses">
            {analytics.topExpenses.map((expense, index) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-rank">#{index + 1}</div>
                <div className="expense-details">
                  <span className="expense-description">{expense.description}</span>
                  <span className="expense-category">{expense.category}</span>
                </div>
                <div className="expense-amount">-${parseFloat(expense.amount).toFixed(2)}</div>
              </div>
            ))}
            {analytics.topExpenses.length === 0 && (
              <p className="no-data">No expense data available</p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="analytics-section">
          <h2>Summary</h2>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Transactions Analyzed:</span>
              <span className="stat-value">{analytics.transactionCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Monthly Income:</span>
              <span className="stat-value">${(analytics.totalIncome / 1).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Monthly Expense:</span>
              <span className="stat-value">${(analytics.totalExpenses / 1).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Financial Health:</span>
              <span className={`stat-value health-${
                analytics.savingsRate > 20 ? 'excellent' : 
                analytics.savingsRate > 10 ? 'good' : 
                analytics.savingsRate > 0 ? 'fair' : 'poor'
              }`}>
                {analytics.savingsRate > 20 ? 'Excellent' : 
                 analytics.savingsRate > 10 ? 'Good' : 
                 analytics.savingsRate > 0 ? 'Fair' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;