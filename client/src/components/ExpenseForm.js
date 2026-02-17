import React, { useState } from 'react';
import './ExpenseForm.css';

function ExpenseForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Generate a unique request ID for idempotency
  const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (submitError) setSubmitError(null);
    if (submitSuccess) setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setSubmitError('Please enter a valid positive amount');
      return;
    }
    if (!formData.category.trim()) {
      setSubmitError('Please enter a category');
      return;
    }
    if (!formData.description.trim()) {
      setSubmitError('Please enter a description');
      return;
    }
    if (!formData.date) {
      setSubmitError('Please select a date');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const requestId = generateRequestId();
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      request_id: requestId
    };

    try {
      await onSubmit(expenseData);
      
      // Success - reset form
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setSubmitSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error.message || 'Failed to create expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      {submitError && (
        <div className="form-error" role="alert">
          {submitError}
        </div>
      )}
      
      {submitSuccess && (
        <div className="form-success" role="alert">
          Expense added successfully!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="amount">
          Amount (₹) <span className="required">*</span>
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
          disabled={isSubmitting}
          placeholder="0.00"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">
          Category <span className="required">*</span>
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          placeholder="e.g., Food, Transport, Entertainment"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          rows="3"
          placeholder="Brief description of the expense"
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">
          Date <span className="required">*</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}

export default ExpenseForm;

