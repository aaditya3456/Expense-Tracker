const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Helper to create JWT
function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          error: 'Server misconfigured',
          message: 'JWT_SECRET is not set in server/.env',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const normalizedEmail = email.toLowerCase();

      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res
          .status(400)
          .json({ error: 'A user with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      });

      const savedUser = await user.save();
      const token = createToken(savedUser);

      res.status(201).json({
        message: 'Signup successful',
        token,
        user: savedUser,
      });
    } catch (err) {
      console.error('Error in /auth/signup:', err);
      res.status(500).json({ error: 'Failed to sign up', message: err.message });
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          error: 'Server misconfigured',
          message: 'JWT_SECRET is not set in server/.env',
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase();

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = createToken(user);

      res.json({
        message: 'Login successful',
        token,
        user,
      });
    } catch (err) {
      console.error('Error in /auth/login:', err);
      res.status(500).json({ error: 'Failed to log in', message: err.message });
    }
  }
);

module.exports = router;


