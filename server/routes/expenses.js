const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { body, validationResult, query, param } = require('express-validator');
const auth = require('../middleware/auth');

// All expense routes are protected

// POST /expenses - Create a new expense
router.post(
  '/',
  auth,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO8601 date'),
    body('request_id').optional().isString().withMessage('Request ID must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, category, description, date, request_id } = req.body;

      // Idempotency check: if request_id is provided and expense exists, return existing
      if (request_id) {
        const existingExpense = await Expense.findOne({ request_id });
        if (existingExpense) {
          return res.status(200).json({
            message: 'Expense already exists (idempotent response)',
            expense: existingExpense
          });
        }
      }

      // Create new expense
      const expense = new Expense({
        user: req.user.id,
        amount: parseFloat(amount),
        category: category.trim(),
        description: description.trim(),
        date: new Date(date),
        request_id: request_id || undefined
      });

      const savedExpense = await expense.save();
      
      res.status(201).json({
        message: 'Expense created successfully',
        expense: savedExpense
      });
    } catch (error) {
      // Handle duplicate request_id error
      if (error.code === 11000 && error.keyPattern?.request_id) {
        const existingExpense = await Expense.findOne({ request_id: req.body.request_id });
        return res.status(200).json({
          message: 'Expense already exists (idempotent response)',
          expense: existingExpense
        });
      }

      console.error('Error creating expense:', error);
      res.status(500).json({ 
        error: 'Failed to create expense',
        message: error.message 
      });
    }
  }
);

// GET /expenses - Get list of expenses with filtering and sorting
router.get(
  '/',
  auth,
  [
    query('category').optional().trim(),
    query('sort').optional().isIn(['date_desc', 'date_asc']).withMessage('Sort must be date_desc or date_asc'),
    query('search').optional().trim(),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO8601'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO8601')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { category, sort = 'date_desc', search, startDate, endDate } = req.query;

      // Build query
      const query = { user: req.user.id };
      if (category) {
        query.category = category;
      }
      if (search) {
        query.description = { $regex: search, $options: 'i' }; // Case-insensitive search
      }
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include entire end date
          query.date.$lte = end;
        }
      }

      // Build sort
      const sortOrder = sort === 'date_desc' ? -1 : 1;
      const sortObj = { date: sortOrder };

      // Fetch expenses
      const expenses = await Expense.find(query)
        .sort(sortObj)
        .select('-request_id -__v'); // Exclude internal fields

      res.json({
        expenses,
        count: expenses.length
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ 
        error: 'Failed to fetch expenses',
        message: error.message 
      });
    }
  }
);

// PUT /expenses/:id - Update an existing expense (only owner)
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid expense id'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').optional().trim().notEmpty().withMessage('Category is required'),
    body('description').optional().trim().notEmpty().withMessage('Description is required'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO8601 date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = {};

      if (req.body.amount !== undefined) updates.amount = parseFloat(req.body.amount);
      if (req.body.category !== undefined) updates.category = req.body.category.trim();
      if (req.body.description !== undefined) updates.description = req.body.description.trim();
      if (req.body.date !== undefined) updates.date = new Date(req.body.date);

      const expense = await Expense.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { $set: updates },
        { new: true }
      ).select('-request_id -__v');

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({
        message: 'Expense updated successfully',
        expense,
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({
        error: 'Failed to update expense',
        message: error.message,
      });
    }
  }
);

// DELETE /expenses/:id - Delete an expense (only owner)
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid expense id')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const deleted = await Expense.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        error: 'Failed to delete expense',
        message: error.message,
      });
    }
  }
);

// GET /expenses/export/csv - Export expenses as CSV
router.get(
  '/export/csv',
  auth,
  [
    query('category').optional().trim(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const { category, startDate, endDate } = req.query;
      const query = { user: req.user.id };
      
      if (category) {
        query.category = category;
      }
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }

      const expenses = await Expense.find(query)
        .sort({ date: -1 })
        .select('-request_id -__v -user');

      // Generate CSV
      const headers = ['Date', 'Category', 'Description', 'Amount (₹)'];
      const rows = expenses.map(expense => {
        const date = new Date(expense.date).toLocaleDateString('en-IN');
        const amount = typeof expense.amount === 'object' 
          ? parseFloat(expense.amount.toString()).toFixed(2)
          : parseFloat(expense.amount).toFixed(2);
        return [
          date,
          expense.category,
          `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
          amount
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csvContent); // BOM for Excel compatibility
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({
        error: 'Failed to export expenses',
        message: error.message,
      });
    }
  }
);

module.exports = router;

