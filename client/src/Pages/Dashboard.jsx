
import React, {useState, useEffect} from 'react';
import '../Styles/Dashboard.css'

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetch("http://127.0.0.1:5555/transactions")
    .then(res => res.json())
    .then(data => {
      setTransactions(data);
      setFilteredTransactions(data);
      calculateTotals(data);
    })
    .catch(error => {
      console.log("Error fetching transactions:", error);
    })
  }, []);

  const calculateTotals = (transactionData) => {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactionData.forEach(transaction => {
      if (transaction.transaction_type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.transaction_type === "expense") {
        totalExpenses += transaction.amount;
      }
    });
    
    setIncome(totalIncome);
    setExpenses(totalExpenses);
    setTotalBalance(totalIncome - totalExpenses);
  };

  const filterByDate = () => {
    if (!startDate && !endDate) {
      setFilteredTransactions(transactions);
      calculateTotals(transactions);
      return;
    }

    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      
      return transactionDate >= start && transactionDate <= end;
    });

    setFilteredTransactions(filtered);
    calculateTotals(filtered);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilteredTransactions(transactions);
    calculateTotals(transactions);
  };

  // Calculate transactions by category
  const getCategoryTotals = () => {
    const categories = {};
    filteredTransactions.forEach(transaction => {
      if (transaction.transaction_type === "expense") {
        const category = transaction.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + transaction.amount;
      }
    });
    return categories;
  };

  const categoryTotals = getCategoryTotals();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <p>Welcome to your financial overview</p>
      </header>

      {/* Date Filter Section */}
      <div className="filter-section">
        <div className="date-filter">
          <h3>Filter by Date Range</h3>
          <div className="filter-controls">
            <div className="date-input-group">
              <label>From: </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>To: </label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            <button onClick={filterByDate} className="btn btn-primary">
              Apply Filter
            </button>
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear
            </button>
          </div>
          <p className="transaction-count">Showing {filteredTransactions.length} transactions</p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="financial-overview">
        <div className="stats-grid">
          <div className="stat-card balance-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Balance</h3>
              <p className="stat-amount">${totalBalance.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="stat-card income-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Total Income</h3>
              <p className="stat-amount">${income.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="stat-card expense-card">
            <div className="stat-icon">📉</div>
            <div className="stat-info">
              <h3>Total Expenses</h3>
              <p className="stat-amount">${expenses.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card transaction-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Transactions</h3>
              <p className="stat-amount">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Transactions */}
        <div className="recent-transactions">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {filteredTransactions.slice(0, 10).map(transaction => (
              <div key={transaction.id} className={`transaction-item ${transaction.transaction_type}`}>
                <div className="transaction-main">
                  <span className="transaction-desc">{transaction.description || 'No description'}</span>
                  <span className={`transaction-amount ${transaction.transaction_type}`}>
                    {transaction.transaction_type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </div>
                <div className="transaction-meta">
                  <span className="transaction-category">{transaction.category || 'Uncategorized'}</span>
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <p className="no-transactions">No transactions found</p>
            )}
          </div>
        </div>

        {/* Spending by Category */}
        <div className="category-breakdown">
          <h3>Spending by Category</h3>
          <div className="categories-list">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="category-item">
                <div className="category-info">
                  <span className="category-name">{category}</span>
                  <span className="category-amount">${amount.toFixed(2)}</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-progress" 
                    style={{ 
                      width: `${(amount / expenses) * 100}%`,
                      backgroundColor: expenses > 0 ? '#ff6b6b' : '#ccc'
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && (
              <p className="no-categories">No expense data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;