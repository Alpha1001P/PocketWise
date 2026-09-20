import { useState, useEffect } from "react";
import "./TransactionModal.css";

import {
  getTransactions,
  getUserSettings,
} from "../lib/database";

function TransactionForm({
  onAdd,
  onUpdate,
  editingTransaction,
  accounts = [],
  onClose,
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Expense");
  const [selectedCategory, setSelectedCategory] =
    useState("Food");

  const [account, setAccount] = useState(
    accounts[0]?.name || "Cash Wallet"
  );

  const [showSuccess, setShowSuccess] = useState(false);

  // ========================================
  // BUDGET STATE
  // ========================================

  const [monthlyBudget, setMonthlyBudget] =
    useState(25000);

  const [currentExpense, setCurrentExpense] =
    useState(0);

  // ========================================
  // CATEGORIES
  // ========================================

  const expenseCategories = [
    { label: "Food", icon: "🍔" },
    { label: "Shopping", icon: "🛍️" },
    { label: "Travel", icon: "✈️" },
    { label: "Bills", icon: "🧾" },
    { label: "Health", icon: "🏥" },
    { label: "Education", icon: "🎓" },
    { label: "Other", icon: "🏷️" },
  ];

  const incomeCategories = [
    { label: "Salary", icon: "💼" },
    { label: "Allowance", icon: "💵" },
    { label: "Freelance", icon: "💻" },
    { label: "Investment", icon: "📈" },
    { label: "Other", icon: "🎁" },
  ];

  // ========================================
  // LOAD BUDGET + EXPENSES FROM SUPABASE
  // ========================================

  useEffect(() => {
    async function loadBudgetData() {
      try {
        const [settingsResult, transactionsResult] =
          await Promise.all([
            getUserSettings(),
            getTransactions(),
          ]);

        // Load monthly budget
        if (
          settingsResult.data &&
          settingsResult.data.monthly_budget !== undefined
        ) {
          setMonthlyBudget(
            Number(
              settingsResult.data.monthly_budget
            ) || 25000
          );
        }

        // Calculate current month's expenses
        const transactions =
          transactionsResult.data || [];

        const now = new Date();

        const expense = transactions
          .filter((transaction) => {
            if (transaction.type !== "Expense") {
              return false;
            }

            if (!transaction.date) {
              return false;
            }

            const date = new Date(
              transaction.date
            );

            return (
              date.getMonth() ===
                now.getMonth() &&
              date.getFullYear() ===
                now.getFullYear()
            );
          })
          .reduce(
            (sum, transaction) =>
              sum +
              Number(transaction.amount || 0),
            0
          );

        setCurrentExpense(expense);
      } catch (error) {
        console.error(
          "Could not load Supabase budget data:",
          error
        );

        setCurrentExpense(0);
      }
    }

    loadBudgetData();
  }, []);

  // ========================================
  // SET ACCOUNT WHEN ACCOUNTS LOAD
  // ========================================

  useEffect(() => {
    if (editingTransaction) {
      return;
    }

    if (accounts.length > 0) {
      const accountStillExists = accounts.some(
        (item) => item.name === account
      );

      if (!accountStillExists) {
        setAccount(accounts[0].name);
      }
    }
  }, [
    accounts,
    account,
    editingTransaction,
  ]);

  // ========================================
  // LOAD EDITING TRANSACTION
  // ========================================

  useEffect(() => {
    if (editingTransaction) {
      setTitle(
        editingTransaction.description ||
          editingTransaction.title ||
          ""
      );

      setAmount(
        editingTransaction.amount || ""
      );

      setCategory(
        editingTransaction.type || "Expense"
      );

      setSelectedCategory(
        editingTransaction.category ||
          (editingTransaction.type === "Income"
            ? "Salary"
            : "Food")
      );

      setAccount(
        editingTransaction.account ||
          accounts[0]?.name ||
          "Cash Wallet"
      );
    }
  }, [editingTransaction, accounts]);

  // ========================================
  // BUDGET CALCULATION
  // ========================================

  const enteredAmount =
    Number(amount) || 0;

  const previewExpense =
    category === "Expense"
      ? currentExpense + enteredAmount
      : currentExpense;

  const remainingBudget = Math.max(
    monthlyBudget - previewExpense,
    0
  );

  const remainingPercentage =
    monthlyBudget > 0
      ? Math.max(
          0,
          Math.round(
            (remainingBudget /
              monthlyBudget) *
              100
          )
        )
      : 0;

  let budgetStatus = "healthy";

  if (remainingPercentage <= 15) {
    budgetStatus = "danger";
  } else if (remainingPercentage <= 35) {
    budgetStatus = "warning";
  }

  // ========================================
  // CATEGORY DETECTION
  // ========================================

  function detectCategory(text, type) {
    if (type === "Income") {
      return selectedCategory || "Salary";
    }

    const lower = text.toLowerCase();

    if (
      lower.includes("swiggy") ||
      lower.includes("zomato") ||
      lower.includes("food") ||
      lower.includes("pizza") ||
      lower.includes("burger") ||
      lower.includes("tea") ||
      lower.includes("coffee")
    ) {
      return "Food";
    }

    if (
      lower.includes("uber") ||
      lower.includes("ola") ||
      lower.includes("fuel") ||
      lower.includes("petrol") ||
      lower.includes("bus") ||
      lower.includes("flight") ||
      lower.includes("metro")
    ) {
      return "Travel";
    }

    if (
      lower.includes("amazon") ||
      lower.includes("flipkart") ||
      lower.includes("myntra") ||
      lower.includes("shopping") ||
      lower.includes("clothes")
    ) {
      return "Shopping";
    }

    if (
      lower.includes("recharge") ||
      lower.includes("jio") ||
      lower.includes("airtel") ||
      lower.includes("wifi") ||
      lower.includes("bill") ||
      lower.includes("rent")
    ) {
      return "Bills";
    }

    if (
      lower.includes("medicine") ||
      lower.includes("doctor") ||
      lower.includes("hospital") ||
      lower.includes("pharmacy")
    ) {
      return "Health";
    }

    if (
      lower.includes("course") ||
      lower.includes("book") ||
      lower.includes("college") ||
      lower.includes("fee") ||
      lower.includes("tuition")
    ) {
      return "Education";
    }

    return selectedCategory || "Other";
  }

  function handleTitleChange(value) {
    setTitle(value);

    if (category === "Income") {
      return;
    }

    const detected = detectCategory(
      value,
      category
    );

    if (detected !== "Other") {
      setSelectedCategory(detected);
    }
  }

  // ========================================
  // SUBMIT
  // ========================================

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !amount) {
      alert(
        "Please provide both title and amount."
      );
      return;
    }

    if (Number(amount) <= 0) {
      alert(
        "Amount must be greater than 0."
      );
      return;
    }

    const transactionType =
      category === "Income"
        ? "Income"
        : "Expense";

    const finalCategory =
      selectedCategory ||
      detectCategory(
        title,
        transactionType
      );

    const transaction = {
      // Keep existing ID only for editing.
      id: editingTransaction
        ? editingTransaction.id
        : undefined,

      // Your Supabase table uses "description"
      // instead of "title".
      description: title.trim(),

      amount: Number(amount),

      type: transactionType,

      category: finalCategory,

      account:
        account ||
        accounts[0]?.name ||
        "Cash Wallet",

      // Find the actual account ID
      account_id:
        accounts.find(
          (item) => item.name === account
        )?.id || null,

      date: editingTransaction
        ? editingTransaction.date
        : new Date().toISOString(),
    };

    if (editingTransaction) {
      if (onUpdate) {
        onUpdate(transaction);
      }
    } else {
      if (onAdd) {
        onAdd(transaction);
      }
    }

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);

      if (onClose) {
        onClose();
      }
    }, 900);
  }

  const currentCategories =
    category === "Income"
      ? incomeCategories
      : expenseCategories;

  // ========================================
  // UI
  // ========================================

  return (
    <form
      className="transaction-form-card"
      onSubmit={handleSubmit}
    >
      {/* HEADER */}

      <div className="form-header">
        <div className="form-title-wrap">
          <div className="form-icon-pill">
            {editingTransaction
              ? "✏️"
              : "💸"}
          </div>

          <div>
            <h2>
              {editingTransaction
                ? "Edit Transaction"
                : "New Transaction"}
            </h2>

            <p>
              Track your cashflow with instant
              budget insights
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="close-form-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* SUCCESS */}

      {showSuccess && (
        <div className="success-toast">
          <span>✅</span>

          <span>
            Transaction saved successfully!
          </span>
        </div>
      )}

      {/* INCOME / EXPENSE */}

      <div className="type-segmented-control">
        <button
          type="button"
          className={`type-segment-btn ${
            category === "Expense"
              ? "active-expense"
              : ""
          }`}
          onClick={() => {
            setCategory("Expense");
            setSelectedCategory("Food");
          }}
        >
          <span>📉 Expense</span>
        </button>

        <button
          type="button"
          className={`type-segment-btn ${
            category === "Income"
              ? "active-income"
              : ""
          }`}
          onClick={() => {
            setCategory("Income");
            setSelectedCategory("Salary");
          }}
        >
          <span>📈 Income</span>
        </button>
      </div>

      {/* AMOUNT */}

      <div className="amount-input-group">
        <label>Amount</label>

        <div className="amount-field-wrap">
          <span className="currency-prefix">
            ₹
          </span>

          <input
            type="number"
            step="any"
            min="0"
            placeholder="0"
            autoFocus
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />
        </div>
      </div>

      {/* BUDGET PREVIEW */}

      {category === "Expense" && (
        <div
          className={`modal-budget-preview-box ${budgetStatus}`}
        >
          <div className="preview-meter-ring">
            <strong>
              {remainingPercentage}%
            </strong>

            <small>Left</small>
          </div>

          <div className="preview-meter-details">
            <div className="meter-label-row">
              <span>Budget Left</span>

              <strong>
                ₹
                {remainingBudget.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <p>
              {enteredAmount > 0
                ? `After spending ₹${enteredAmount.toLocaleString(
                    "en-IN"
                  )}`
                : `Total monthly budget: ₹${monthlyBudget.toLocaleString(
                    "en-IN"
                  )}`}
            </p>
          </div>
        </div>
      )}

      {/* TITLE */}

      <div className="form-input-group">
        <label>Transaction Title</label>

        <input
          className="modal-input"
          placeholder="e.g. Swiggy lunch, Freelance work, Metro pass..."
          value={title}
          onChange={(event) =>
            handleTitleChange(
              event.target.value
            )
          }
        />
      </div>

      {/* CATEGORY */}

      <div className="form-input-group">
        <label>Category</label>

        <div className="category-pill-grid">
          {currentCategories.map((cat) => (
            <button
              type="button"
              key={cat.label}
              className={`category-pill ${
                selectedCategory ===
                cat.label
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(
                  cat.label
                )
              }
            >
              <span>{cat.icon}</span>

              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ACCOUNT */}

      <div className="form-input-group">
        <label>Account</label>

        <select
          className="modal-select"
          value={account}
          onChange={(event) =>
            setAccount(event.target.value)
          }
        >
          {accounts.length > 0 ? (
            accounts.map((item) => (
              <option
                key={item.id}
                value={item.name}
              >
                {item.icon || "💵"}{" "}
                {item.name}
              </option>
            ))
          ) : (
            <option value="Cash Wallet">
              💵 Cash Wallet
            </option>
          )}
        </select>
      </div>

      {/* ACTIONS */}

      <div className="modal-footer-actions">
        {onClose && (
          <button
            type="button"
            className="modal-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="modal-submit-button"
        >
          {editingTransaction
            ? "Update Transaction"
            : "Save Transaction"}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;