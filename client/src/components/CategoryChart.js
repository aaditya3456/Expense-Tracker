import React from 'react';
import './CategoryChart.css';

function CategoryChart({ expenses }) {
  if (!expenses || expenses.length === 0) return null;

  const totals = expenses.reduce((acc, expense) => {
    const amount =
      typeof expense.amount === 'object'
        ? parseFloat(expense.amount.toString())
        : parseFloat(expense.amount);
    if (isNaN(amount)) return acc;
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const entries = Object.entries(totals).map(([category, total]) => ({
    category,
    total,
  }));

  if (entries.length === 0) return null;

  const maxTotal = Math.max(...entries.map((e) => e.total));

  return (
    <div className="category-chart">
      <h3>Spending by Category</h3>
      <div className="category-bars">
        {entries.map(({ category, total }) => {
          const widthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          return (
            <div key={category} className="category-bar-row">
              <div className="category-bar-label">{category}</div>
              <div className="category-bar-track">
                <div
                  className="category-bar-fill"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <div className="category-bar-amount">
                ₹{total.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryChart;


