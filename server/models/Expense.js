const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: function(value) {
      if (typeof value === 'object' && value.toString) {
        return parseFloat(value.toString());
      }
      return value;
    }
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  // For idempotency - prevent duplicate submissions
  request_id: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  toJSON: { getters: true }
});

// Index for efficient querying
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);

