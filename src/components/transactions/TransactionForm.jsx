import { useState, useEffect } from "react";
import "./TransactionModal.css";

import {
  getTransactions,
  getUserSettings,
  getTransactionRules,
  saveTransactionRule,
} from "../../lib/database";

import {
  detectTransactionCategory,
  getCategoryIcon,
} from "../../utils/categoryDetector";

function TransactionForm({
  onAdd,
  onUpdate,
  editingTransaction,
  accounts = [],
  onClose,
}) {
  // ========================================
  // BASIC FORM STATE
  // ========================================

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
  // SMART CATEGORY STATE
  // ========================================

  const [autoDetectedCategory, setAutoDetectedCategory] =
    useState(null);

  const [categoryManuallySelected, setCategoryManuallySelected] =
    useState(false);

  const [transactionRules, setTransactionRules] =
    useState([]);

  const [learnedCategory, setLearnedCategory] =
    useState(null);

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
    { label: "Entertainment", icon: "🎬" },
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
  // LOAD TRANSACTION RULES
  // ========================================

  useEffect(() => {
    async function loadTransactionRules() {
      try {
        const { data, error } =
          await getTransactionRules();

        if (error) {
          console.error(
            "Could not load transaction rules:",
            error
          );
          return;
        }

        setTransactionRules(data || []);
      } catch (error) {
        console.error(
          "Transaction rules error:",
          error
        );
      }
    }

    loadTransactionRules();
  }, []);

  // ========================================
  // LOAD BUDGET + EXPENSES
  // ========================================

  useEffect(() => {
    async function loadBudgetData() {
      try {
        const [
          settingsResult,
          transactionsResult,
        ] = await Promise.all([
          getUserSettings(),
          getTransactions(),
        ]);

        // Monthly budget
        if (
          settingsResult.data &&
          settingsResult.data.monthly_budget !==
            undefined
        ) {
          setMonthlyBudget(
            Number(
              settingsResult.data.monthly_budget
            ) || 25000
          );
        }

        // Current month expenses
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
              date.getMonth() === now.getMonth() &&
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
      const accountStillExists =
        accounts.some(
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
    if (!editingTransaction) {
      return;
    }

    const existingTitle =
      editingTransaction.description ||
      editingTransaction.title ||
      "";

    const existingType =
      editingTransaction.type || "Expense";

    const existingCategory =
      editingTransaction.category ||
      (existingType === "Income"
        ? "Salary"
        : "Food");

    setTitle(existingTitle);

    setAmount(
      editingTransaction.amount || ""
    );

    setCategory(existingType);

    setSelectedCategory(existingCategory);

    // Editing an existing transaction should
    // not automatically change its category.
    setCategoryManuallySelected(true);

    setAutoDetectedCategory(null);
    setLearnedCategory(null);

    setAccount(
      editingTransaction.account ||
        accounts[0]?.name ||
        "Cash Wallet"
    );
  }, [
    editingTransaction,
    accounts,
  ]);

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
  // FIND USER'S LEARNED CATEGORY
  // ========================================

  function findLearnedCategory(text, type) {
    if (!text.trim()) {
      return null;
    }

    const normalizedText = text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    const matchingRule = transactionRules
      .filter(
        (rule) =>
          rule.transaction_type === type &&
          normalizedText.includes(
            rule.keyword
          )
      )
      .sort(
        (a, b) =>
          b.keyword.length -
          a.keyword.length
      )[0];

    return matchingRule || null;
  }

  // ========================================
  // TITLE CHANGE + SMART DETECTION
  // ========================================

  function handleTitleChange(value) {
    setTitle(value);

    setLearnedCategory(null);
    setAutoDetectedCategory(null);

    if (!value.trim()) {
      return;
    }

    const transactionType =
      category === "Income"
        ? "Income"
        : "Expense";

    // ----------------------------------------
    // FIRST: USER'S LEARNED RULE
    // ----------------------------------------

    const learnedRule =
      findLearnedCategory(
        value,
        transactionType
      );

    if (learnedRule) {
      setSelectedCategory(
        learnedRule.category
      );

      setLearnedCategory(
        learnedRule.category
      );

      setCategoryManuallySelected(false);

      return;
    }

    // ----------------------------------------
    // SECOND: BUILT-IN DETECTOR
    // ----------------------------------------

    if (categoryManuallySelected) {
      return;
    }

    const detected =
      detectTransactionCategory(
        value,
        transactionType
      );

    if (detected) {
      setSelectedCategory(detected);
      setAutoDetectedCategory(detected);
    }
  }

  // ========================================
  // CHANGE TRANSACTION TYPE
  // ========================================

  function handleExpenseType() {
    setCategory("Expense");

    setCategoryManuallySelected(false);
    setLearnedCategory(null);
    setAutoDetectedCategory(null);

    const learnedRule =
      findLearnedCategory(
        title,
        "Expense"
      );

    if (learnedRule) {
      setSelectedCategory(
        learnedRule.category
      );

      setLearnedCategory(
        learnedRule.category
      );

      return;
    }

    const detected =
      detectTransactionCategory(
        title,
        "Expense"
      );

    if (detected) {
      setSelectedCategory(detected);
      setAutoDetectedCategory(detected);
    } else {
      setSelectedCategory("Food");
    }
  }

  function handleIncomeType() {
    setCategory("Income");

    setCategoryManuallySelected(false);
    setLearnedCategory(null);
    setAutoDetectedCategory(null);

    const learnedRule =
      findLearnedCategory(
        title,
        "Income"
      );

    if (learnedRule) {
      setSelectedCategory(
        learnedRule.category
      );

      setLearnedCategory(
        learnedRule.category
      );

      return;
    }

    const detected =
      detectTransactionCategory(
        title,
        "Income"
      );

    if (detected) {
      setSelectedCategory(detected);
      setAutoDetectedCategory(detected);
    } else {
      setSelectedCategory("Salary");
    }
  }

  // ========================================
  // MANUAL CATEGORY SELECTION
  // ========================================

  async function handleManualCategorySelect(
    categoryName
  ) {
    setSelectedCategory(categoryName);

    setCategoryManuallySelected(true);

    setAutoDetectedCategory(null);
    setLearnedCategory(null);

    if (!title.trim()) {
      return;
    }

    const transactionType =
      category === "Income"
        ? "Income"
        : "Expense";

    const words = title
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return;
    }

    // First word becomes the learned keyword.
    //
    // Swiggy lunch
    //      ↓
    // swiggy → chosen category
    //
    // Uber college
    //      ↓
    // uber → chosen category

    const keyword = words[0];

    try {
      const { data, error } =
        await saveTransactionRule(
          keyword,
          categoryName,
          transactionType
        );

      if (error) {
        console.error(
          "Could not save transaction rule:",
          error
        );

        return;
      }

      if (data) {
        setTransactionRules(
          (previousRules) => {
            const filteredRules =
              previousRules.filter(
                (rule) =>
                  !(
                    rule.keyword ===
                      data.keyword &&
                    rule.transaction_type ===
                      data.transaction_type
                  )
              );

            return [
              data,
              ...filteredRules,
            ];
          }
        );
      }
    } catch (error) {
      console.error(
        "Smart rule save error:",
        error
      );
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

    // ----------------------------------------
    // CHECK LEARNED RULE FIRST
    // ----------------------------------------

    const learnedRule =
      findLearnedCategory(
        title,
        transactionType
      );

    // ----------------------------------------
    // BUILT-IN DETECTION SECOND
    // ----------------------------------------

    const detectedCategory =
      detectTransactionCategory(
        title,
        transactionType
      );

    const finalCategory =
      categoryManuallySelected
        ? selectedCategory
        : learnedRule
        ? learnedRule.category
        : detectedCategory ||
          selectedCategory ||
          (transactionType === "Income"
            ? "Salary"
            : "Other");

    const transaction = {
      id: editingTransaction
        ? editingTransaction.id
        : undefined,

      description: title.trim(),

      amount: Number(amount),

      type: transactionType,

      category: finalCategory,

      account:
        account ||
        accounts[0]?.name ||
        "Cash Wallet",

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

  // ========================================
  // CURRENT CATEGORY LIST
  // ========================================

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
          onClick={handleExpenseType}
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
          onClick={handleIncomeType}
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

        {/* LEARNED CATEGORY MESSAGE */}

        {learnedCategory && (
          <div className="auto-category-detected">
            <span className="auto-category-icon">
              🧠
            </span>

            <span>
              Based on your previous choice:{" "}
              <strong>
                {getCategoryIcon(
                  learnedCategory
                )}{" "}
                {learnedCategory}
              </strong>
            </span>
          </div>
        )}

        {/* BUILT-IN AUTO DETECTION MESSAGE */}

        {autoDetectedCategory &&
          !categoryManuallySelected &&
          !learnedCategory && (
            <div className="auto-category-detected">
              <span className="auto-category-icon">
                ✨
              </span>

              <span>
                Auto-detected as{" "}
                <strong>
                  {getCategoryIcon(
                    autoDetectedCategory
                  )}{" "}
                  {autoDetectedCategory}
                </strong>
              </span>
            </div>
          )}
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
                selectedCategory === cat.label
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handleManualCategorySelect(
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