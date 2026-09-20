import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TransactionForm from "../components/TransactionForm";

import {
  getTransactions,
  getAccounts,
  createTransaction,
} from "../lib/database";

import "../styles/calendar.css";
import "../components/TransactionModal.css";

const categoryIcons = {
  Food: "🍔",
  Travel: "✈️",
  Shopping: "🛍️",
  Education: "🎓",
  Entertainment: "🎮",
  Health: "🏥",
  Bills: "🧾",
  Salary: "💼",
  Pocket: "👛",
  Freelance: "💻",
  Investment: "📈",
  Allowance: "💵",
  Other: "📦",
};

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function Calendar() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date()
  );

  const [currentViewDate, setCurrentViewDate] =
    useState(new Date());

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  /* ==========================================
     LOAD DATA FROM SUPABASE
  ========================================== */

  async function loadData() {
    const [transactionsResult, accountsResult] =
      await Promise.all([
        getTransactions(),
        getAccounts(),
      ]);

    if (transactionsResult.error) {
      console.error(
        "Calendar - transaction loading error:",
        transactionsResult.error
      );
    }

    if (accountsResult.error) {
      console.error(
        "Calendar - account loading error:",
        accountsResult.error
      );
    }

    setTransactions(transactionsResult.data || []);
    setAccounts(accountsResult.data || []);

    console.log(
      "CALENDAR - SUPABASE TRANSACTIONS:",
      transactionsResult.data
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const viewYear = currentViewDate.getFullYear();
  const viewMonth = currentViewDate.getMonth();

  const daysInMonth = new Date(
    viewYear,
    viewMonth + 1,
    0
  ).getDate();

  const firstDayOfWeek = new Date(
    viewYear,
    viewMonth,
    1
  ).getDay();

  const monthName = currentViewDate.toLocaleString(
    "en-US",
    {
      month: "long",
    }
  );

  /* ==========================================
     TRANSACTIONS FOR CURRENT MONTH
  ========================================== */

  const monthTransactionsMap = useMemo(() => {
    const map = {};

    transactions.forEach((transaction) => {
      if (!transaction.date) {
        return;
      }

      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      if (
        date.getFullYear() === viewYear &&
        date.getMonth() === viewMonth
      ) {
        const day = date.getDate();

        if (!map[day]) {
          map[day] = {
            income: 0,
            expense: 0,
            items: [],
          };
        }

        const amount = Number(
          transaction.amount || 0
        );

        if (transaction.type === "Income") {
          map[day].income += amount;
        } else if (transaction.type === "Expense") {
          map[day].expense += amount;
        }

        map[day].items.push(transaction);
      }
    });

    return map;
  }, [transactions, viewYear, viewMonth]);

  /* ==========================================
     SELECTED DATE TRANSACTIONS
  ========================================== */

  const selectedDayTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.date) {
        return false;
      }

      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return isSameDate(date, selectedDate);
    });
  }, [transactions, selectedDate]);

  /* ==========================================
     DAILY TOTALS
  ========================================== */

  const totalIncome = selectedDayTransactions.reduce(
    (sum, transaction) => {
      if (transaction.type === "Income") {
        return sum + Number(transaction.amount || 0);
      }

      return sum;
    },
    0
  );

  const totalExpense = selectedDayTransactions.reduce(
    (sum, transaction) => {
      if (transaction.type === "Expense") {
        return sum + Number(transaction.amount || 0);
      }

      return sum;
    },
    0
  );

  const netBalance = totalIncome - totalExpense;

  /* ==========================================
     MONTH NAVIGATION
  ========================================== */

  function handlePrevMonth() {
    const newDate = new Date(
      viewYear,
      viewMonth - 1,
      1
    );

    setCurrentViewDate(newDate);
  }

  function handleNextMonth() {
    const newDate = new Date(
      viewYear,
      viewMonth + 1,
      1
    );

    setCurrentViewDate(newDate);
  }

  function handleToday() {
    const now = new Date();

    setCurrentViewDate(now);
    setSelectedDate(now);
  }

  /* ==========================================
     SELECT DAY
  ========================================== */

  function handleSelectDay(day) {
    const newDate = new Date(
      viewYear,
      viewMonth,
      day
    );

    setSelectedDate(newDate);
  }

  /* ==========================================
     ADD TRANSACTION TO SUPABASE
  ========================================== */

  async function handleAddTransaction(
    newTransaction
  ) {
    const transactionWithDate = {
      ...newTransaction,
      date:
        newTransaction.date ||
        new Date().toISOString(),
    };

    console.log(
      "CALENDAR - ADDING TRANSACTION:",
      transactionWithDate
    );

    const result = await createTransaction(
      transactionWithDate
    );

    if (result.error) {
      console.error(
        "Calendar - transaction save error:",
        result.error
      );

      alert(
        "Could not save transaction.\n\n" +
          result.error.message
      );

      return;
    }

    console.log(
      "CALENDAR - TRANSACTION SAVED:",
      result.data
    );

    setShowTransactionModal(false);

    const newTransactionDate = new Date(
      transactionWithDate.date
    );

    if (
      !Number.isNaN(newTransactionDate.getTime())
    ) {
      setSelectedDate(newTransactionDate);
      setCurrentViewDate(newTransactionDate);
    }

    await loadData();
  }

  /* ==========================================
     TODAY / SELECTED DATE
  ========================================== */

  const today = new Date();

  const isSelectedDateToday = isSameDate(
    today,
    selectedDate
  );

  const formattedSelectedDate =
    selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar
          onAddTransaction={() => {
            setShowTransactionModal(true);
          }}
        />

        <main className="calendar-page">

          {/* TOP HEADER */}

          <div className="calendar-header-banner">
            <div>
              <span className="calendar-pill">
                📅 Cashflow Calendar
              </span>

              <h1>Interactive Calendar</h1>

              <p>
                Select any day to inspect daily
                transactions and cash balance.
              </p>
            </div>

            <div className="calendar-quick-controls">
              <button
                type="button"
                className="calendar-nav-btn today-btn"
                onClick={handleToday}
              >
                Today
              </button>

              <input
                type="date"
                className="calendar-date-picker-input"
                value={getLocalDateString(
                  selectedDate
                )}
                onChange={(event) => {
                  if (!event.target.value) {
                    return;
                  }

                  const [year, month, day] =
                    event.target.value
                      .split("-")
                      .map(Number);

                  const selected = new Date(
                    year,
                    month - 1,
                    day
                  );

                  setSelectedDate(selected);
                  setCurrentViewDate(selected);
                }}
              />
            </div>
          </div>

          {/* MAIN CALENDAR GRID */}

          <div className="calendar-main-grid">

            {/* LEFT: MONTHLY CALENDAR */}

            <div className="calendar-card month-view-card">
              <div className="month-nav-header">
                <button
                  type="button"
                  className="month-arrow-btn"
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                >
                  ‹
                </button>

                <h2>
                  {monthName} <span>{viewYear}</span>
                </h2>

                <button
                  type="button"
                  className="month-arrow-btn"
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                >
                  ›
                </button>
              </div>

              {/* WEEK DAYS */}

              <div className="calendar-weekdays-row">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* CALENDAR DAYS */}

              <div className="calendar-days-grid">

                {/* EMPTY CELLS */}

                {Array.from({
                  length: firstDayOfWeek,
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="calendar-day-cell empty"
                    aria-hidden="true"
                  />
                ))}

                {/* DAYS */}

                {Array.from({
                  length: daysInMonth,
                }).map((_, index) => {
                  const dayNumber = index + 1;

                  const isCurrentDay =
                    today.getDate() === dayNumber &&
                    today.getMonth() === viewMonth &&
                    today.getFullYear() === viewYear;

                  const isSelected =
                    selectedDate.getDate() ===
                      dayNumber &&
                    selectedDate.getMonth() ===
                      viewMonth &&
                    selectedDate.getFullYear() ===
                      viewYear;

                  const dayData =
                    monthTransactionsMap[dayNumber];

                  return (
                    <button
                      type="button"
                      key={`day-${dayNumber}`}
                      className={`calendar-day-cell ${
                        isCurrentDay ? "today" : ""
                      } ${
                        isSelected ? "selected" : ""
                      } ${
                        dayData ? "has-data" : ""
                      }`}
                      onClick={() =>
                        handleSelectDay(dayNumber)
                      }
                      aria-label={`${monthName} ${dayNumber}, ${viewYear}`}
                    >
                      <span className="day-number">
                        {dayNumber}
                      </span>

                      {dayData && (
                        <div className="day-badges">
                          {dayData.expense > 0 && (
                            <span
                              className="day-dot expense"
                              title={`Spent ₹${dayData.expense.toLocaleString(
                                "en-IN"
                              )}`}
                            />
                          )}

                          {dayData.income > 0 && (
                            <span
                              className="day-dot income"
                              title={`Earned ₹${dayData.income.toLocaleString(
                                "en-IN"
                              )}`}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CALENDAR LEGEND */}

              <div className="calendar-legend">
                <div>
                  <span className="legend-dot income" />
                  Income
                </div>

                <div>
                  <span className="legend-dot expense" />
                  Expense
                </div>

                <div>
                  <span className="legend-today" />
                  Today
                </div>
              </div>
            </div>

            {/* RIGHT: DAILY DETAILS */}

            <div className="calendar-card daily-details-card">
              <div className="daily-details-header">
                <div>
                  <div className="daily-tag-row">
                    <span className="daily-tag">
                      {isSelectedDateToday
                        ? "Today"
                        : "Selected Date"}
                    </span>
                  </div>

                  <h3>
                    {formattedSelectedDate}
                  </h3>
                </div>

                <button
                  type="button"
                  className="add-day-tx-btn"
                  onClick={() =>
                    setShowTransactionModal(true)
                  }
                >
                  ＋ Add Entry
                </button>
              </div>

              {/* DAILY SUMMARY */}

              <div className="day-stats-row">
                <div className="day-stat-card income">
                  <span className="stat-label">
                    Income
                  </span>

                  <strong>
                    +₹
                    {totalIncome.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="day-stat-card expense">
                  <span className="stat-label">
                    Expense
                  </span>

                  <strong>
                    -₹
                    {totalExpense.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div
                  className={`day-stat-card balance ${
                    netBalance >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  <span className="stat-label">
                    Net Balance
                  </span>

                  <strong>
                    {netBalance >= 0 ? "+" : "-"}₹
                    {Math.abs(
                      netBalance
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              {/* TRANSACTIONS */}

              <div className="daily-transactions-box">
                <div className="daily-tx-title">
                  <h4>
                    Transactions (
                    {selectedDayTransactions.length})
                  </h4>
                </div>

                {selectedDayTransactions.length ===
                0 ? (
                  <div className="daily-empty-state">
                    <span className="empty-calendar-icon">
                      🍃
                    </span>

                    <h5>
                      No transactions recorded
                    </h5>

                    <p>
                      You have no income or expenses
                      logged for this date.
                    </p>

                    <button
                      type="button"
                      className="add-first-tx-btn"
                      onClick={() =>
                        setShowTransactionModal(true)
                      }
                    >
                      Record a transaction
                    </button>
                  </div>
                ) : (
                  <div className="daily-tx-list">
                    {[...selectedDayTransactions]
                      .sort(
                        (a, b) =>
                          new Date(b.date) -
                          new Date(a.date)
                      )
                      .map((transaction) => {
                        const icon =
                          categoryIcons[
                            transaction.category
                          ] || "📦";

                        const isIncome =
                          transaction.type ===
                          "Income";

                        return (
                          <div
                            key={transaction.id}
                            className="daily-tx-item"
                          >
                            <div className="daily-tx-left">
                              <div
                                className={`daily-tx-icon ${
                                  isIncome
                                    ? "income"
                                    : "expense"
                                }`}
                              >
                                {icon}
                              </div>

                              <div className="daily-tx-info">
                                <h5>
                                  {transaction.description ||
                                    transaction.title ||
                                    "Untitled Transaction"}
                                </h5>

                                <p>
                                  {transaction.category ||
                                    "Other"}{" "}
                                  •{" "}
                                  {transaction.account ||
                                    "Cash Wallet"}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`daily-tx-amount ${
                                isIncome
                                  ? "income"
                                  : "expense"
                              }`}
                            >
                              <span>
                                {isIncome ? "+" : "-"}₹
                                {Number(
                                  transaction.amount ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ADD TRANSACTION MODAL */}

      {showTransactionModal && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (
              event.target === event.currentTarget
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

export default Calendar;