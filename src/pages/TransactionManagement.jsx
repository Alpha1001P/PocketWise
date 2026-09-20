import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TransactionCard from "../components/TransactionCard";
import TransactionForm from "../components/TransactionForm";

import {
  getTransactions,
  getAccounts,
  createTransaction,
} from "../lib/database";

import "../styles/transactions.css";
import "../components/TransactionModal.css";

function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // ========================================
  // LOAD DATA FROM SUPABASE
  // ========================================

  async function refreshTransactions() {
    const [transactionsResult, accountsResult] = await Promise.all([
      getTransactions(),
      getAccounts(),
    ]);

    if (transactionsResult.error) {
      console.error(
        "Error loading transactions:",
        transactionsResult.error
      );
    }

    if (accountsResult.error) {
      console.error(
        "Error loading accounts:",
        accountsResult.error
      );
    }

    setTransactions(transactionsResult.data || []);
    setAccounts(accountsResult.data || []);
  }

  useEffect(() => {
    refreshTransactions();
  }, []);

  // ========================================
  // FILTER TRANSACTIONS
  // ========================================

  const filteredTransactions = transactions.filter((item) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      (item.title || item.description || "")
        .toLowerCase()
        .includes(searchText);

    const matchFilter =
      filter === "All"
        ? true
        : filter === "Pinned"
        ? item.pinned
        : item.type === filter;

    const matchAccount =
      selectedAccount === "All"
        ? true
        : item.account === selectedAccount;

    return matchSearch && matchFilter && matchAccount;
  });

  // ========================================
  // SORT TRANSACTIONS
  // ========================================

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => {
      switch (sortBy) {
        case "Newest":
          return new Date(b.date) - new Date(a.date);

        case "Oldest":
          return new Date(a.date) - new Date(b.date);

        case "Highest":
          return Number(b.amount) - Number(a.amount);

        case "Lowest":
          return Number(a.amount) - Number(b.amount);

        case "AZ":
          return (a.title || a.description || "").localeCompare(
            b.title || b.description || ""
          );

        case "ZA":
          return (b.title || b.description || "").localeCompare(
            a.title || a.description || ""
          );

        default:
          return 0;
      }
    }
  );

  // ========================================
  // STATISTICS
  // ========================================

  const totalTransactions = filteredTransactions.length;

  const totalIncome = filteredTransactions
    .filter((item) => item.type === "Income")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const totalExpense = filteredTransactions
    .filter((item) => item.type === "Expense")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const pinnedCount = filteredTransactions.filter(
    (item) => item.pinned
  ).length;

  const filteredTotal = filteredTransactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // ========================================
  // ADD TRANSACTION
  // ========================================

  async function handleAddTransaction(newTransaction) {
    console.log("ADDING TRANSACTION:", newTransaction);

    const result = await createTransaction(newTransaction);

    if (result.error) {
      console.error(
        "Error creating transaction:",
        result.error
      );

      alert(
        "Could not save transaction.\n\n" +
        result.error.message
      );

      return;
    }

    console.log(
      "TRANSACTION SAVED TO SUPABASE:",
      result.data
    );

    setShowTransactionModal(false);

    // Reload from Supabase
    await refreshTransactions();
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-area">
        <Navbar
          onAddTransaction={() =>
            setShowTransactionModal(true)
          }
        />

        <main className="transaction-page">

          {/* HEADER */}
          <div className="transaction-header">
            <div>
              <h1>💳 Transaction Management</h1>

              <p>
                View, search and filter all your transactions
              </p>
            </div>

            <div className="transaction-count">
              {totalTransactions}

              <span>Transactions</span>
            </div>
          </div>

          {/* SEARCH */}
          <input
            className="transaction-search"
            placeholder="🔍 Search transaction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* STATS */}
          <div className="transaction-stats">

            <div className="stat-card">
              <h4>Total</h4>
              <h2>{totalTransactions}</h2>
            </div>

            <div className="stat-card">
              <h4>Income</h4>

              <h2>
                ₹{totalIncome.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="stat-card">
              <h4>Expense</h4>

              <h2>
                ₹{totalExpense.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="stat-card">
              <h4>Pinned</h4>
              <h2>{pinnedCount}</h2>
            </div>

          </div>

          {/* FILTERS */}
          <div className="transaction-filters">

            <div className="filter-group">
              <label>Transaction Type</label>

              <div className="filter-buttons">

                {[
                  "All",
                  "Income",
                  "Expense",
                  "Pinned",
                ].map((type) => (
                  <button
                    key={type}
                    className={
                      filter === type
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setFilter(type)
                    }
                  >
                    {type === "Income"
                      ? "💰 Income"
                      : type === "Expense"
                      ? "💸 Expense"
                      : type === "Pinned"
                      ? "⭐ Pinned"
                      : "All"}
                  </button>
                ))}

              </div>
            </div>

            {/* ACCOUNT FILTER */}
            <div className="account-filter">
              <label>Account</label>

              <select
                value={selectedAccount}
                onChange={(e) =>
                  setSelectedAccount(e.target.value)
                }
              >
                <option value="All">
                  🌍 All Accounts
                </option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.name}
                  >
                    {account.icon || "💵"}{" "}
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SORT */}
            <div className="account-filter">
              <label>Sort By</label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="Newest">
                  Newest First
                </option>

                <option value="Oldest">
                  Oldest First
                </option>

                <option value="Highest">
                  Highest Amount
                </option>

                <option value="Lowest">
                  Lowest Amount
                </option>

                <option value="AZ">
                  A → Z
                </option>

                <option value="ZA">
                  Z → A
                </option>
              </select>
            </div>

          </div>

          {/* SUMMARY */}
          <div className="transaction-summary">

            <p>
              Showing{" "}
              <strong>
                {totalTransactions}
              </strong>{" "}
              Transactions
            </p>

            <h3>
              ₹{filteredTotal.toLocaleString("en-IN")}
            </h3>

          </div>

          {/* HISTORY */}
          <h2 className="history-title">
            Transaction History
          </h2>

          <div className="transaction-cards">

            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((item) => (
                <TransactionCard
                  key={item.id}
                  transaction={item}
                  refreshTransactions={
                    refreshTransactions
                  }
                />
              ))
            ) : (
              <div className="no-transactions">
                <h3>No transactions found</h3>

                <p>
                  Try changing the search or filter.
                </p>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {showTransactionModal && (
        <div className="modal-overlay">

          <TransactionForm
            accounts={accounts}

            onAdd={handleAddTransaction}

            onClose={() =>
              setShowTransactionModal(false)
            }
          />

        </div>
      )}

    </div>
  );
}

export default TransactionManagement;