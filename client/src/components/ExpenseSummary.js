import React from 'react';
import './ExpenseSummary.css';

function ExpenseSummary({ expenses }) {
  // Calculate totals per category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = typeof expense.amount === 'object' 
      ? parseFloat(expense.amount.toString()) 
      : parseFloat(expense.amount);
    
    if (isNaN(amount)) return acc;
    
    const category = expense.category;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  // Convert to array and sort by amount (descending)
  const summaryData = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  if (summaryData.length === 0) {
    return null;
  }

  // Calculate overall total
  const overallTotal = summaryData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="expense-summary">
      <h3>Summary by Category</h3>
      <div className="summary-list">
        {summaryData.map(({ category, total }) => {
          const percentage = overallTotal > 0 ? (total / overallTotal * 100).toFixed(1) : 0;
          return (
            <div key={category} className="summary-item">
              <div className="summary-category">{category}</div>
              <div className="summary-amount">₹{total.toFixed(2)}</div>
              <div className="summary-percentage">({percentage}%)</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExpenseSummary;

