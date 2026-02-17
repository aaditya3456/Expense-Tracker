import React from 'react';
import './ExpenseStatistics.css';

function ExpenseStatistics({ expenses }) {
  if (expenses.length === 0) {
    return null;
  }

  const amounts = expenses.map(expense => {
    const amount = typeof expense.amount === 'object' 
      ? parseFloat(expense.amount.toString()) 
      : parseFloat(expense.amount);
    return isNaN(amount) ? 0 : amount;
  }).filter(a => a > 0);

  if (amounts.length === 0) {
    return null;
  }

  const total = amounts.reduce((sum, a) => sum + a, 0);
  const average = total / amounts.length;
  const highest = Math.max(...amounts);
  const lowest = Math.min(...amounts);
  const count = amounts.length;

  // Find expense with highest and lowest amounts
  const highestExpense = expenses.find(e => {
    const a = typeof e.amount === 'object' ? parseFloat(e.amount.toString()) : parseFloat(e.amount);
    return !isNaN(a) && a === highest;
  });

  const lowestExpense = expenses.find(e => {
    const a = typeof e.amount === 'object' ? parseFloat(e.amount.toString()) : parseFloat(e.amount);
    return !isNaN(a) && a === lowest;
  });

  const formatAmount = (amount) => `₹${amount.toFixed(2)}`;

  return (
    <div className="expense-statistics">
      <h3>Statistics</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value primary">{formatAmount(total)}</div>
          <div className="stat-detail">{count} {count === 1 ? 'expense' : 'expenses'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average</div>
          <div className="stat-value secondary">{formatAmount(average)}</div>
          <div className="stat-detail">Per expense</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Highest</div>
          <div className="stat-value success">{formatAmount(highest)}</div>
          {highestExpense && (
            <div className="stat-detail">{highestExpense.category}</div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Lowest</div>
          <div className="stat-value info">{formatAmount(lowest)}</div>
          {lowestExpense && (
            <div className="stat-detail">{lowestExpense.category}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseStatistics;

