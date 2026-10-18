import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import TransactionForm from "../components/transactions/TransactionForm";

import {
  getTransactions,
  getAccounts,
  createTransaction,
} from "../lib/database";

import "../components/transactions/TransactionModal.css";
import "../styles/reports.css";

function Reports() {
  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  const [showTransactions, setShowTransactions] =
    useState(false);

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date()
  );

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  /* ==========================================
     LOAD SUPABASE DATA
  ========================================== */

  async function loadData() {
    const [transactionsResult, accountsResult] =
      await Promise.all([
        getTransactions(),
        getAccounts(),
      ]);

    if (transactionsResult.error) {
      console.error(
        "Reports - transaction loading error:",
        transactionsResult.error
      );
    }

    if (accountsResult.error) {
      console.error(
        "Reports - account loading error:",
        accountsResult.error
      );
    }

    setTransactions(transactionsResult.data || []);
    setAccounts(accountsResult.data || []);

    console.log(
      "REPORTS - SUPABASE TRANSACTIONS:",
      transactionsResult.data
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ==========================================
     DATE INPUT HELPER
  ========================================== */

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* ==========================================
     MONTH OPTIONS
  ========================================== */

  const monthOptions = useMemo(() => {
    const years = new Set();

    transactions.forEach((transaction) => {
      if (!transaction.date) return;

      const date = new Date(transaction.date);

      if (!Number.isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });

    years.add(new Date().getFullYear());

    const sortedYears = Array.from(years).sort(
      (a, b) => b - a
    );

    const options = [];

    sortedYears.forEach((year) => {
      for (let month = 0; month < 12; month++) {
        const value = `${year}-${String(
          month + 1
        ).padStart(2, "0")}`;

        const label = new Date(
          year,
          month,
          1
        ).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        options.push({
          value,
          label,
        });
      }
    });

    return options;
  }, [transactions]);

  /* ==========================================
     MONTH TRANSACTIONS
  ========================================== */

  const monthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const transactionMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      return transactionMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  /* ==========================================
     DAILY TRANSACTIONS
  ========================================== */

  const dailyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

      const transactionDate = new Date(
        transaction.date
      );

      if (Number.isNaN(transactionDate.getTime())) {
        return false;
      }

      return (
        transactionDate.getDate() ===
          selectedDate.getDate() &&
        transactionDate.getMonth() ===
          selectedDate.getMonth() &&
        transactionDate.getFullYear() ===
          selectedDate.getFullYear()
      );
    });
  }, [transactions, selectedDate]);

  /* ==========================================
     DAILY SPENDING
  ========================================== */

  const dailySpending = useMemo(() => {
    return dailyTransactions.reduce(
      (sum, transaction) => {
        if (transaction.type === "Expense") {
          return sum + Number(transaction.amount || 0);
        }

        return sum;
      },
      0
    );
  }, [dailyTransactions]);

  /* ==========================================
     TOTAL INCOME
  ========================================== */

  const totalIncome = useMemo(() => {
    return monthTransactions.reduce(
      (sum, transaction) => {
        if (transaction.type === "Income") {
          return sum + Number(transaction.amount || 0);
        }

        return sum;
      },
      0
    );
  }, [monthTransactions]);

  /* ==========================================
     TOTAL EXPENSE
  ========================================== */

  const totalExpense = useMemo(() => {
    return monthTransactions.reduce(
      (sum, transaction) => {
        if (transaction.type === "Expense") {
          return sum + Number(transaction.amount || 0);
        }

        return sum;
      },
      0
    );
  }, [monthTransactions]);

  /* ==========================================
     SAVINGS
  ========================================== */

  const savings = totalIncome - totalExpense;

  /* ==========================================
     SAVING RATE
  ========================================== */

  const savingRate =
    totalIncome === 0
      ? 0
      : ((savings / totalIncome) * 100).toFixed(1);

  /* ==========================================
     EXPENSE TRANSACTIONS
  ========================================== */

  const expenseTransactions = useMemo(() => {
    return monthTransactions.filter(
      (transaction) => transaction.type === "Expense"
    );
  }, [monthTransactions]);

  /* ==========================================
     CATEGORY ANALYSIS
  ========================================== */

  const categoryTotals = useMemo(() => {
    const totals = {};

    expenseTransactions.forEach((transaction) => {
      const category =
        transaction.category || "Other";

      const amount = Number(
        transaction.amount || 0
      );

      if (amount <= 0) return;

      totals[category] =
        (totals[category] || 0) + amount;
    });

    return totals;
  }, [expenseTransactions]);

  const topCategories = useMemo(() => {
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [categoryTotals]);

  /* ==========================================
     CATEGORY TOTALS
  ========================================== */

  const categoryCount =
    Object.keys(categoryTotals).length;

  const categoryTotalExpenses =
    expenseTransactions.reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0
    );

  /* ==========================================
     FORMATTED DATE
  ========================================== */

  const formattedSelectedDate =
    selectedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  /* ==========================================
     CATEGORY ICONS
  ========================================== */

  const categoryIcons = {
    Food: "🍔",
    Travel: "✈️",
    Shopping: "🛍️",
    Education: "🎓",
    Entertainment: "🎮",
    Health: "❤️",
    Bills: "🧾",
    Salary: "💼",
    Pocket: "👛",
    Freelance: "💻",
    Investment: "📈",
    Allowance: "💵",
    Other: "📦",
  };

  /* ==========================================
     ADD TRANSACTION
  ========================================== */

  async function handleAddTransaction(
    newTransaction
  ) {
    console.log(
      "REPORTS - ADDING TRANSACTION:",
      newTransaction
    );

    const result = await createTransaction(
      newTransaction
    );

    if (result.error) {
      console.error(
        "Reports - transaction save error:",
        result.error
      );

      alert(
        "Could not save transaction.\n\n" +
          result.error.message
      );

      return;
    }

    console.log(
      "REPORTS - TRANSACTION SAVED:",
      result.data
    );

    setShowTransactionModal(false);

    await loadData();
  }

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar
          onAddTransaction={() =>
            setShowTransactionModal(true)
          }
        />

        <main className="reports-page">

          {/* PAGE HEADER */}

          <div className="reports-page-header">
            <div className="reports-title">
              <div className="reports-title-icon">
                📊
              </div>

              <div>
                <h1>Reports & Analytics</h1>

                <p>
                  Understand your spending, savings and
                  financial habits.
                </p>
              </div>
            </div>
          </div>

          {/* DAILY SPENDING */}

          <section className="daily-card">
            <div className="daily-card-glow"></div>

            <div className="daily-header">
              <div>
                <span className="daily-label">
                  DAILY SPENDING
                </span>

                <h3>{formattedSelectedDate}</h3>
              </div>

              <input
                type="date"
                className="date-btn"
                aria-label="Select date"
                value={formatDateForInput(
                  selectedDate
                )}
                onChange={(event) => {
                  if (!event.target.value) return;

                  setSelectedDate(
                    new Date(
                      `${event.target.value}T00:00:00`
                    )
                  );
                }}
              />
            </div>

            <div className="daily-main">
              <div>
                <h1>
                  ₹
                  {dailySpending.toLocaleString(
                    "en-IN"
                  )}
                </h1>

                <p className="daily-subtitle">
                  Total expense for this day
                </p>
              </div>

              <button
                type="button"
                className="transaction-link"
                onClick={() =>
                  setShowTransactions(true)
                }
              >
                🧾

                <span>
                  {dailyTransactions.length}{" "}
                  {dailyTransactions.length === 1
                    ? "Transaction"
                    : "Transactions"}
                </span>

                <strong>→</strong>
              </button>
            </div>
          </section>

          {/* SUMMARY CARDS */}

          <section className="report-summary-cards">

            <div className="report-card spending-card">
              <div className="report-card-top">
                <div className="report-card-icon">
                  💸
                </div>

                <span>Expenses</span>
              </div>

              <h2>
                ₹
                {totalExpense.toLocaleString(
                  "en-IN"
                )}
              </h2>

              <p>Total spending</p>
            </div>

            <div className="report-card income-card">
              <div className="report-card-top">
                <div className="report-card-icon">
                  📈
                </div>

                <span>Income</span>
              </div>

              <h2>
                ₹
                {totalIncome.toLocaleString(
                  "en-IN"
                )}
              </h2>

              <p>Total income</p>
            </div>

            <div className="report-card savings-card">
              <div className="report-card-top">
                <div className="report-card-icon">
                  💰
                </div>

                <span>Savings</span>
              </div>

              <h2>
                ₹
                {savings.toLocaleString("en-IN")}
              </h2>

              <p>Money saved</p>
            </div>

            <div className="report-card rate-card">
              <div className="report-card-top">
                <div className="report-card-icon">
                  🎯
                </div>

                <span>Saving Rate</span>
              </div>

              <h2>{savingRate}%</h2>

              <p>Income retained</p>
            </div>

          </section>

          {/* ANALYTICS GRID */}

          <div className="report-layout">

            {/* EXPENSE BY CATEGORY */}

            <div className="reports-expense-wrapper">
              <section className="expense-category-card">

                <div className="expense-category-header">

                  <div className="expense-category-title">
                    <div className="expense-category-icon">
                      💸
                    </div>

                    <div>
                      <span className="expense-category-label">
                        SPENDING BREAKDOWN
                      </span>

                      <h2>
                        Expense by Category
                      </h2>

                      <p>
                        See where your money is going
                      </p>
                    </div>
                  </div>

                  <div className="expense-category-viewing">
                    <span>📅 Viewing</span>

                    <select
                      value={selectedMonth}
                      aria-label="Select month"
                      onChange={(event) =>
                        setSelectedMonth(
                          event.target.value
                        )
                      }
                    >
                      {monthOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* CHART */}

                <div className="expense-category-chart">
                  <div className="expense-chart-glow"></div>

                  <div className="expense-chart-inner">
                    <ExpensePieChart
                      transactions={monthTransactions}
                    />
                  </div>
                </div>

                {/* FOOTER */}

                <div className="expense-category-footer">

                  <div className="expense-footer-item">
                    <div className="expense-footer-icon category-icon">
                      📊
                    </div>

                    <div className="expense-footer-content">
                      <span>Categories</span>

                      <strong>
                        {categoryCount}
                      </strong>
                    </div>
                  </div>

                  <div className="expense-footer-divider"></div>

                  <div className="expense-footer-item">
                    <div className="expense-footer-icon money-icon">
                      💰
                    </div>

                    <div className="expense-footer-content">
                      <span>Total Expenses</span>

                      <strong>
                        ₹
                        {categoryTotalExpenses.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>

                </div>

              </section>
            </div>

            {/* CATEGORY ANALYSIS */}

            <section className="chart-card category-analysis-card">

              <div className="category-analysis-header">
                <div>
                  <span className="chart-small-label">
                    TOP CATEGORIES
                  </span>

                  <h2>Category Analysis</h2>
                </div>

                <div className="category-header-icon">
                  📊
                </div>
              </div>

              {topCategories.length === 0 ? (
                <div className="empty-category">

                  <div className="empty-category-icon">
                    📊
                  </div>

                  <h3>No expense data</h3>

                  <p>
                    Add expenses to see your spending
                    categories.
                  </p>

                </div>
              ) : (
                <div className="category-list">

                  {topCategories.map(
                    ([category, amount], index) => {
                      const percentage =
                        totalExpense > 0
                          ? (amount / totalExpense) *
                            100
                          : 0;

                      return (
                        <div
                          key={category}
                          className="category-item"
                        >

                          <div className="category-item-top">

                            <div className="category-left">

                              <div
                                className={`category-icon category-color-${index}`}
                              >
                                {categoryIcons[
                                  category
                                ] || "📦"}
                              </div>

                              <div className="category-info">
                                <strong>
                                  {category}
                                </strong>

                                <small>
                                  {percentage.toFixed(
                                    1
                                  )}
                                  % of spending
                                </small>
                              </div>

                            </div>

                            <div className="category-value">
                              <strong className="category-amount">
                                ₹
                                {amount.toLocaleString(
                                  "en-IN"
                                )}
                              </strong>
                            </div>

                          </div>

                          <div className="category-progress">
                            <div
                              className={`category-progress-bar category-progress-${index}`}
                              style={{
                                width: `${Math.min(
                                  percentage,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </section>

          </div>

          {/* DAILY TRANSACTIONS POPUP */}

          {showTransactions && (
            <div
              className="transaction-overlay"
              onClick={() =>
                setShowTransactions(false)
              }
            >
              <div
                className="transaction-popup"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <button
                  type="button"
                  className="close-popup"
                  aria-label="Close daily transactions"
                  onClick={() =>
                    setShowTransactions(false)
                  }
                >
                  ✖
                </button>

                <div className="popup-header">

                  <div className="popup-icon">
                    🧾
                  </div>

                  <div>
                    <h2>
                      Daily Transactions
                    </h2>

                    <p>
                      {formattedSelectedDate}
                    </p>
                  </div>

                </div>

                {dailyTransactions.length === 0 ? (
                  <div className="popup-empty">

                    <div>💸</div>

                    <p>
                      No transactions on this date.
                    </p>

                  </div>
                ) : (
                  <div className="popup-list">

                    {dailyTransactions.map(
                      (transaction, index) => (
                        <div
                          className="popup-item"
                          key={
                            transaction.id || index
                          }
                        >

                          <div className="popup-item-left">

                            <div className="popup-item-icon">
                              {transaction.type ===
                              "Expense"
                                ? "💸"
                                : "💰"}
                            </div>

                            <div>
                              <strong>
                                {transaction.category ||
                                  "Other"}
                              </strong>

                              <p>
                                {transaction.description ||
                                  transaction.title ||
                                  "No note"}
                              </p>
                            </div>

                          </div>

                          <strong
                            className={
                              transaction.type ===
                              "Expense"
                                ? "expense-text"
                                : "income-text"
                            }
                          >
                            {transaction.type ===
                            "Expense"
                              ? "-"
                              : "+"}
                            ₹
                            {Number(
                              transaction.amount || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD TRANSACTION MODAL */}

      {showTransactionModal && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowTransactionModal(false);
            }
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <TransactionForm
              accounts={accounts}
              onAdd={handleAddTransaction}
              onClose={() =>
                setShowTransactionModal(false)
              }
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default Reports;