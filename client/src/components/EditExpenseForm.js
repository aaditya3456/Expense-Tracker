import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './EditExpenseForm.css';

function EditExpenseForm({ expense, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (expense) {
      const date = expense.date
        ? new Date(expense.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      const amount =
        typeof expense.amount === 'object'
          ? parseFloat(expense.amount.toString())
          : parseFloat(expense.amount);

      setFormData({
        amount: isNaN(amount) ? '' : amount.toString(),
        category: expense.category || '',
        description: expense.description || '',
        date,
      });
    }
  }, [expense]);

  if (!expense) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    if (!formData.category.trim()) {
      setError('Please enter a category');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        amount: parseFloat(formData.amount),
        category: formData.category.trim(),
        description: formData.description.trim(),
        date: formData.date,
      });
    } catch (err) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!expense} title="Edit expense" onClose={onCancel}>
      {error && (
        <div className="edit-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-expense-form">
        <div className="edit-form-row">
          <div className="edit-form-group">
            <label htmlFor="edit-amount">Amount (₹)</label>
            <input
              id="edit-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="edit-form-group">
            <label htmlFor="edit-date">Date</label>
            <input
              id="edit-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        <div className="edit-form-group">
          <label htmlFor="edit-category">Category</label>
          <input
            id="edit-category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div className="edit-form-group">
          <label htmlFor="edit-description">Description</label>
          <textarea
            id="edit-description"
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div className="edit-actions">
          <button
            type="button"
            className="edit-cancel-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="edit-save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditExpenseForm;


