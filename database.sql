-- FinanceControl Database Schema
-- This file represents how transactions could be stored in a real SQL database.

CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  description VARCHAR(120) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  category_label VARCHAR(80) NOT NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_transaction_amount
    CHECK (amount > 0),

  CONSTRAINT check_transaction_type
    CHECK (type IN ('income', 'expense'))
);

-- Example data

INSERT INTO transactions (
  id,
  description,
  amount,
  type,
  category,
  category_label,
  transaction_date
) VALUES
(
  'txn_001',
  'Salary',
  2500.00,
  'income',
  'salary',
  'Salary',
  '2026-05-22'
),
(
  'txn_002',
  'Groceries',
  180.00,
  'expense',
  'food',
  'Food',
  '2026-05-22'
),
(
  'txn_003',
  'Online freelance project',
  600.00,
  'income',
  'freelance',
  'Freelance',
  '2026-05-23'
);

-- Useful queries

-- Get all transactions ordered by date
SELECT *
FROM transactions
ORDER BY transaction_date DESC;

-- Get only income transactions
SELECT *
FROM transactions
WHERE type = 'income'
ORDER BY transaction_date DESC;

-- Get only expense transactions
SELECT *
FROM transactions
WHERE type = 'expense'
ORDER BY transaction_date DESC;

-- Calculate total income
SELECT
  SUM(amount) AS total_income
FROM transactions
WHERE type = 'income';

-- Calculate total expenses
SELECT
  SUM(amount) AS total_expenses
FROM transactions
WHERE type = 'expense';

-- Calculate current balance
SELECT
  COALESCE(SUM(
    CASE
      WHEN type = 'income' THEN amount
      WHEN type = 'expense' THEN -amount
      ELSE 0
    END
  ), 0) AS current_balance
FROM transactions;

-- Group expenses by category
SELECT
  category_label,
  SUM(amount) AS total_amount
FROM transactions
WHERE type = 'expense'
GROUP BY category_label
ORDER BY total_amount DESC;

-- Count transactions by type
SELECT
  type,
  COUNT(*) AS total_transactions
FROM transactions
GROUP BY type;