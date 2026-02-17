import React, { useState } from 'react';
import './ExpenseFilters.css';

function ExpenseFilters({ 
  categories, 
  selectedCategory, 
  sortOrder, 
  search,
  startDate,
  endDate,
  onCategoryChange, 
  onSortChange,
  onSearchChange,
  onDateRangeChange,
  onExportCSV
}) {
  const [showDateRange, setShowDateRange] = useState(false);

  const handleStartDateChange = (e) => {
    onDateRangeChange(e.target.value, endDate);
  };

  const handleEndDateChange = (e) => {
    onDateRangeChange(startDate, e.target.value);
  };

  const clearDateRange = () => {
    onDateRangeChange('', '');
    setShowDateRange(false);
  };

  return (
    <div className="expense-filters">
      <div className="filter-row-main">
        <div className="filter-group">
          <label htmlFor="search-filter">Search:</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Search by description..."
            value={search || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort:</label>
          <select
            id="sort-filter"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>

        <div className="filter-group">
          <button
            type="button"
            className="filter-button date-range-toggle"
            onClick={() => setShowDateRange(!showDateRange)}
          >
            {showDateRange ? 'Hide' : 'Show'} Date Range
          </button>
        </div>

        <div className="filter-group">
          <button
            type="button"
            className="filter-button export-button"
            onClick={onExportCSV}
            title="Export to CSV"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {showDateRange && (
        <div className="date-range-filters">
          <div className="filter-group">
            <label htmlFor="start-date">From:</label>
            <input
              id="start-date"
              type="date"
              value={startDate || ''}
              onChange={handleStartDateChange}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="end-date">To:</label>
            <input
              id="end-date"
              type="date"
              value={endDate || ''}
              onChange={handleEndDateChange}
              className="filter-input"
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              className="filter-button clear-button"
              onClick={clearDateRange}
            >
              Clear Dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpenseFilters;
