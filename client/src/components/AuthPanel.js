import React, { useState } from 'react';
import { login, signup } from '../services/api';
import './AuthPanel.css';

function AuthPanel({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup' && !formData.name.trim()) {
        setError('Name is required for signup');
        setLoading(false);
        return;
      }
      const payload =
        mode === 'signup'
          ? {
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
            }
          : {
              email: formData.email.trim(),
              password: formData.password,
            };

      const { user } =
        mode === 'signup' ? await signup(payload) : await login(payload);

      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError(null);
  };

  return (
    <div className="auth-panel">
      <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <p className="auth-subtitle">
        {mode === 'login'
          ? 'Log in to manage your expenses'
          : 'Create an account to start tracking your expenses'}
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'signup' && (
          <div className="auth-form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required={mode === 'signup'}
            />
          </div>
        )}

        <div className="auth-form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="auth-submit-button"
          disabled={loading}
        >
          {loading
            ? mode === 'login'
              ? 'Logging in...'
              : 'Signing up...'
            : mode === 'login'
            ? 'Login'
            : 'Sign Up'}
        </button>
      </form>

      <button
        type="button"
        className="auth-switch-button"
        onClick={switchMode}
        disabled={loading}
      >
        {mode === 'login'
          ? "Don't have an account? Sign up"
          : 'Already have an account? Log in'}
      </button>
    </div>
  );
}

export default AuthPanel;


