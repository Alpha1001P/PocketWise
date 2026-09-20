import { useEffect, useMemo, useState } from "react";
import "../styles/navbar.css";

import {
  getNotifications,
  markAllRead,
  clearNotifications,
} from "../utils/notifications";

import {
  getTransactions,
  getAccounts,
  getUserSettings,
} from "../lib/database";

function Navbar({ onAddTransaction }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // AI Insights state
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currency, setCurrency] = useState("INR");

  // --------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------

  function loadNotifications() {
    setNotifications(getNotifications());
  }

  // --------------------------------------------------
  // SUPABASE FINANCE DATA
  // --------------------------------------------------

  async function loadFinanceData() {
    try {
      const [
        transactionsResult,
        accountsResult,
        settingsResult,
      ] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getUserSettings(),
      ]);

      if (transactionsResult.error) {
        console.error(
          "Navbar transactions error:",
          transactionsResult.error
        );
      }

      if (accountsResult.error) {
        console.error(
          "Navbar accounts error:",
          accountsResult.error
        );
      }

      if (settingsResult.error) {
        console.error(
          "Navbar settings error:",
          settingsResult.error
        );
      }

      setTransactions(
        Array.isArray(transactionsResult.data)
          ? transactionsResult.data
          : []
      );

      setAccounts(
        Array.isArray(accountsResult.data)
          ? accountsResult.data
          : []
      );

      const savedCurrency =
        settingsResult.data?.currency || "INR";

      setCurrency(savedCurrency);
    } catch (error) {
      console.error(
        "Navbar finance data error:",
        error
      );

      setTransactions([]);
      setAccounts([]);
    }
  }

  useEffect(() => {
    loadNotifications();
    loadFinanceData();

    // Refresh finance data when Navbar is mounted.
    // This also makes the Navbar pick up newly saved
    // Supabase data when the page/component is revisited.
    const refreshInterval = setInterval(() => {
      loadNotifications();
      loadFinanceData();
    }, 3000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const unread = notifications.filter(
    (item) => !item.read
  ).length;

  function readAll() {
    markAllRead();
    loadNotifications();
  }

  function clearAll() {
    clearNotifications();
    loadNotifications();
  }

  // --------------------------------------------------
  // DATE HELPERS
  // --------------------------------------------------

  function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getTransactionDate(transaction) {
    if (!transaction?.date) {
      return "";
    }

    const value = String(transaction.date);

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return getLocalDateString(parsed);
  }

  // --------------------------------------------------
  // AI INSIGHTS CALCULATIONS
  // --------------------------------------------------

  const aiInsights = useMemo(() => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalSpending = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    let netWorth = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction?.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      const type = String(
        transaction?.type || ""
      ).toLowerCase();

      const transactionDate =
        getTransactionDate(transaction);

      const isIncome =
        type === "income" ||
        type === "credit";

      const isExpense =
        type === "expense" ||
        type === "debit";

      // ------------------------------------------------
      // NET WORTH
      // ------------------------------------------------

      if (isIncome) {
        netWorth += amount;
      } else if (isExpense) {
        netWorth -= amount;
      }

      // ------------------------------------------------
      // CURRENT MONTH
      // ------------------------------------------------

      if (transactionDate) {
        const [year, month] =
          transactionDate
            .split("-")
            .map(Number);

        const isCurrentMonth =
          year === currentYear &&
          month - 1 === currentMonth;

        if (isCurrentMonth) {
          if (isExpense) {
            totalSpending += amount;
            monthlyExpense += amount;
          }

          if (isIncome) {
            monthlyIncome += amount;
          }
        }
      }
    });

    // If there are no transactions,
    // use account balances from Supabase.
    if (
      transactions.length === 0 &&
      accounts.length > 0
    ) {
      const accountBalance =
        accounts.reduce(
          (total, account) => {
            const balance =
              Number(account?.balance);

            return (
              total +
              (Number.isFinite(balance)
                ? balance
                : 0)
            );
          },
          0
        );

      netWorth = accountBalance;
    }

    return {
      totalSpending,
      netWorth,
      monthlySavings:
        monthlyIncome - monthlyExpense,
    };
  }, [transactions, accounts]);

  // --------------------------------------------------
  // CURRENCY FORMAT
  // --------------------------------------------------

  function formatMoney(value) {
    const amount = Number(value) || 0;

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `₹${amount.toLocaleString(
        "en-IN"
      )}`;
    }
  }

  // --------------------------------------------------
  // GREETING
  // --------------------------------------------------

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  const todayString =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
      }
    );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <header className="navbar">

      {/* ================= LEFT ================= */}

      <div className="navbar-left">

        <div className="navbar-greeting-pill">
          <span className="greeting-emoji">
            👋
          </span>

          <span>
            {todayString}
          </span>
        </div>

        <h1 className="navbar-title">
          {greeting}
        </h1>

        <p className="navbar-subtitle">
          Welcome back to PocketWise. Track, save,
          and grow your money.
        </p>

      </div>

      {/* ================= RIGHT ================= */}

      <div className="navbar-right">

        {/* ================= AI INSIGHTS ================= */}

        <div className="ai-insights-wrapper">

          <button
            type="button"
            className={`ai-insights-button ${
              showAIInsights ? "active" : ""
            }`}
            onClick={() =>
              setShowAIInsights(
                (previous) => !previous
              )
            }
            aria-label="AI Insights"
            aria-expanded={showAIInsights}
          >
            <span className="ai-insights-icon">
              🤖
            </span>

            <span className="ai-insights-button-text">
              AI Insights
            </span>
          </button>

          {showAIInsights && (
            <>
              <div
                className="ai-insights-overlay"
                onClick={() =>
                  setShowAIInsights(false)
                }
              />

              <div className="ai-insights-panel">

                {/* Header */}

                <div className="ai-insights-header">

                  <div className="ai-insights-heading">

                    <div className="ai-insights-title-row">

                      <span className="ai-title-icon">
                        🤖
                      </span>

                      <h3>
                        AI Insights
                      </h3>

                    </div>

                    <p>
                      Your personal money overview
                    </p>

                  </div>

                  <button
                    type="button"
                    className="ai-insights-close"
                    onClick={() =>
                      setShowAIInsights(false)
                    }
                    aria-label="Close AI Insights"
                  >
                    ×
                  </button>

                </div>

                {/* Three Metrics */}

                <div className="ai-insights-metrics">

                  {/* Total Spending */}

                  <div className="ai-insight-metric">

                    <div className="ai-metric-icon spending">
                      💸
                    </div>

                    <div className="ai-metric-content">

                      <span className="ai-metric-label">
                        Total Spending
                      </span>

                      <strong className="ai-metric-value">
                        {formatMoney(
                          aiInsights.totalSpending
                        )}
                      </strong>

                      <span className="ai-metric-period">
                        This month
                      </span>

                    </div>

                  </div>

                  {/* Net Worth */}

                  <div className="ai-insight-metric">

                    <div className="ai-metric-icon net-worth">
                      💰
                    </div>

                    <div className="ai-metric-content">

                      <span className="ai-metric-label">
                        Net Worth
                      </span>

                      <strong
                        className={`ai-metric-value ${
                          aiInsights.netWorth < 0
                            ? "negative"
                            : ""
                        }`}
                      >
                        {formatMoney(
                          aiInsights.netWorth
                        )}
                      </strong>

                      <span className="ai-metric-period">
                        Across accounts
                      </span>

                    </div>

                  </div>

                  {/* Monthly Savings */}

                  <div className="ai-insight-metric">

                    <div className="ai-metric-icon savings">
                      📈
                    </div>

                    <div className="ai-metric-content">

                      <span className="ai-metric-label">
                        Monthly Savings
                      </span>

                      <strong
                        className={`ai-metric-value ${
                          aiInsights.monthlySavings < 0
                            ? "negative"
                            : ""
                        }`}
                      >
                        {formatMoney(
                          aiInsights.monthlySavings
                        )}
                      </strong>

                      <span className="ai-metric-period">
                        This month
                      </span>

                    </div>

                  </div>

                </div>

              </div>
            </>
          )}

        </div>

        {/* ================= ADD TRANSACTION ================= */}

        <button
          type="button"
          className="add-transaction-btn"
          onClick={() => {
            if (
              typeof onAddTransaction ===
              "function"
            ) {
              onAddTransaction();
            }
          }}
        >
          <span className="btn-icon">
            ＋
          </span>

          <span className="add-btn-text">
            Add Transaction
          </span>
        </button>

        {/* ================= NOTIFICATIONS ================= */}

        <div className="notification-wrapper">

          <button
            type="button"
            className={`notification-button ${
              open ? "active" : ""
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Notifications"
            aria-expanded={open}
          >
            <span className="bell-icon">
              🔔
            </span>

            {unread > 0 && (
              <span className="notification-badge">
                {unread > 99
                  ? "99+"
                  : unread}
              </span>
            )}
          </button>

          {open && (
            <>
              <div
                className="notification-overlay"
                onClick={() => setOpen(false)}
              />

              <div className="notification-box">

                <div className="notification-top">

                  <div className="notif-title-row">

                    <h3>
                      Notifications
                    </h3>

                    {unread > 0 && (
                      <span className="unread-pill">
                        {unread} new
                      </span>
                    )}

                  </div>

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="mark-read-btn"
                      onClick={readAll}
                    >
                      Mark all read
                    </button>
                  )}

                </div>

                <div className="notification-list">

                  {notifications.length === 0 ? (
                    <div className="empty-notification">

                      <span className="empty-icon">
                        🔕
                      </span>

                      <p>
                        No notifications yet
                      </p>

                      <small>
                        We'll notify you about budget
                        alerts and transactions
                      </small>

                    </div>
                  ) : (
                    notifications.map(
                      (item) => (
                        <div
                          key={item.id}
                          className={`notification-item ${
                            item.read
                              ? "read"
                              : "unread"
                          }`}
                        >

                          <div className="notif-item-header">

                            <strong>
                              {item.title}
                            </strong>

                            <small>
                              {item.date}
                            </small>

                          </div>

                          <p>
                            {item.message}
                          </p>

                        </div>
                      )
                    )
                  )}

                </div>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="clear-notification"
                    onClick={clearAll}
                  >
                    Clear All
                  </button>
                )}

              </div>
            </>
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;