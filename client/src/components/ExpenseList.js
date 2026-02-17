import React from 'react';
import './ExpenseList.css';

function ExpenseList({ expenses, onEditExpense, onDeleteExpense }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>No expenses found.</p>
        <p className="empty-state-hint">Add your first expense using the form above.</p>
      </div>
    );
  }

  const formatAmount = (amount) => {
    const numAmount = typeof amount === 'object' 
      ? parseFloat(amount.toString()) 
      : parseFloat(amount);
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="expense-list-container">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="amount-column">Amount</th>
            <th className="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr key={expense._id || expense.id}>
              <td className="date-cell">{formatDate(expense.date)}</td>
              <td className="category-cell">
                <span className="category-badge">{expense.category}</span>
              </td>
              <td className="description-cell">{expense.description}</td>
              <td className="amount-cell">₹{formatAmount(expense.amount)}</td>
              <td className="actions-cell">
                <button
                  type="button"
                  className="table-button edit-button"
                  onClick={() => onEditExpense && onEditExpense(expense)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="table-button delete-button"
                  onClick={() => onDeleteExpense && onDeleteExpense(expense)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseList;

