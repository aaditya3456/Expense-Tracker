import React, { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseSummary from './components/ExpenseSummary';
import ExpenseStatistics from './components/ExpenseStatistics';
import AuthPanel from './components/AuthPanel';
import EditExpenseForm from './components/EditExpenseForm';
import CategoryChart from './components/CategoryChart';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpensesCSV,
  getStoredAuth,
  setAuthToken,
  storeUser,
  logout as apiLogout,
} from './services/api';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize auth & theme from localStorage
  useEffect(() => {
    const { token, user: storedUser } = getStoredAuth();
    if (token && storedUser) {
      setAuthToken(token);
      setUser(storedUser);
    }
    const storedTheme = localStorage.getItem('expense_app_theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    }
    setInitializing(false);
  }, []);

  // Fetch expenses when user or filters change
  useEffect(() => {
    if (!user) return;
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterCategory, sortOrder, search, startDate, endDate]);

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses(filterCategory, sortOrder, search, startDate, endDate);
      const list = data.expenses || [];
      setExpenses(list);

      const uniqueCategories = [...new Set(list.map((e) => e.category))];
      setCategories(uniqueCategories.sort());
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportExpensesCSV(filterCategory, startDate, endDate);
    } catch (err) {
      setError(err.message || 'Failed to export CSV');
    }
  };

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleAddExpense = async (expenseData) => {
    setError(null);
    try {
      await createExpense(expenseData);
      await loadExpenses();
    } catch (err) {
      setError(err.message || 'Failed to create expense');
      throw err;
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = async (updates) => {
    if (!editingExpense) return;
    setError(null);
    try {
      await updateExpense(editingExpense._id || editingExpense.id, updates);
      setEditingExpense(null);
      await loadExpenses();
    } catch (err) {
      setError(err.message || 'Failed to update expense');
      throw err;
    }
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    setError(null);
    try {
      await deleteExpense(expense._id || expense.id);
      await loadExpenses();
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    storeUser(authUser);
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setExpenses([]);
    setEditingExpense(null);
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.body.classList.add('dark');
      localStorage.setItem('expense_app_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('expense_app_theme', 'light');
    }
  };

  // Total of visible expenses
  const total = expenses.reduce((sum, expense) => {
    const amount =
      typeof expense.amount === 'object'
        ? parseFloat(expense.amount.toString())
        : parseFloat(expense.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Monthly total (current month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyTotal = expenses.reduce((sum, expense) => {
    const date = new Date(expense.date);
    if (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    ) {
      const amount =
        typeof expense.amount === 'object'
          ? parseFloat(expense.amount.toString())
          : parseFloat(expense.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }
    return sum;
  }, 0);

  if (initializing) {
    return (
      <div className="app initializing">
        <header className="app-header">
          <h1>Expense Tracker</h1>
        </header>
        <main className="app-main">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-main">
          <div>
            <h1>Expense Tracker</h1>
            <p>Track and manage your personal expenses</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {user && (
              <div className="user-info">
                <span className="user-name">Hi, {user.name}</span>
                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {!user ? (
          <AuthPanel onAuthSuccess={handleAuthSuccess} />
        ) : (
          <div className="app-container">
            <section className="expense-form-section">
              <h2>Add New Expense</h2>
              <ExpenseForm onSubmit={handleAddExpense} />
            </section>

            <section className="expense-list-section">
              <div className="section-header">
                <div>
                  <h2>Expenses</h2>
                  <p className="monthly-total">
                    This month: <strong>₹{monthlyTotal.toFixed(2)}</strong>
                  </p>
                </div>
                <ExpenseFilters
                  categories={categories}
                  selectedCategory={filterCategory}
                  sortOrder={sortOrder}
                  search={search}
                  startDate={startDate}
                  endDate={endDate}
                  onCategoryChange={setFilterCategory}
                  onSortChange={setSortOrder}
                  onSearchChange={setSearch}
                  onDateRangeChange={handleDateRangeChange}
                  onExportCSV={handleExportCSV}
                />
              </div>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                  <button onClick={loadExpenses} className="retry-button">
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                <div className="loading">Loading expenses...</div>
              ) : (
                <>
                  <ExpenseList
                    expenses={expenses}
                    onEditExpense={handleEditExpense}
                    onDeleteExpense={handleDeleteExpense}
                  />
                  <div className="total-section">
                    <strong>Total: ₹{total.toFixed(2)}</strong>
                    {filterCategory && (
                      <span className="filter-note">
                        (filtered by {filterCategory})
                      </span>
                    )}
                  </div>
                  {editingExpense && (
                    <EditExpenseForm
                      expense={editingExpense}
                      onSave={handleUpdateExpense}
                      onCancel={() => setEditingExpense(null)}
                    />
                  )}
                  {expenses.length > 0 && !filterCategory && !search && !startDate && !endDate && (
                    <>
                      <ExpenseStatistics expenses={expenses} />
                      <ExpenseSummary expenses={expenses} />
                      <CategoryChart expenses={expenses} />
                    </>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

