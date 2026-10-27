import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileTransactionForm from "../components/MobileTransactionForm";

import {
  getAccounts,
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../../lib/database";

import { getCategoryIcon } from "../../utils/categoryDetector";
import "../styles/mobile.css";

function MobileTransactions() {
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setShowAddForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    loadMobileData();
  }, []);

  async function loadMobileData() {
    setLoading(true);

    const [transactionsResult, accountsResult] = await Promise.all([
      getTransactions(),
      getAccounts(),
    ]);

    setTransactions(transactionsResult.data || []);
    setAccounts(accountsResult.data || []);
    setLoading(false);
  }

  async function handleDeleteTransaction(tx) {
    if (!window.confirm(`Delete transaction "${tx.description || tx.category || "Transaction"}" of ₹${tx.amount}?`)) {
      return;
    }

    const { error } = await deleteTransaction(tx.id);
    if (error) {
      alert(error.message || "Failed to delete transaction.");
      return;
    }

    loadMobileData();
  }

  const filteredTransactions = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return [...transactions]
      .filter((tx) => {
        if (filter === "All") return true;
        return tx.type === filter;
      })
      .filter((tx) => {
        if (!searchText) return true;
        const title = tx.description || "";
        const category = tx.category || "";
        const account = tx.account || "";

        return (
          title.toLowerCase().includes(searchText) ||
          category.toLowerCase().includes(searchText) ||
          account.toLowerCase().includes(searchText)
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, filter]);

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="mobile-app">
      <div className="mobile-page">
        <MobileHeader
          title="Transactions"
          subtitle="Cash flow activity"
          initial="T"
        />

        <main className="m-content">
          {/* Search Box */}
          <div className="m-search">
            <span className="m-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, category, or account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="m-search-clear"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="m-filter-row">
            {["All", "Expense", "Income", "Transfer"].map((item) => (
              <button
                key={item}
                type="button"
                className={`m-chip ${filter === item ? `active ${item.toLowerCase()}` : ""}`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Transaction List Card */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">
                {filter === "All" ? "All Entries" : `${filter}s`}
              </h2>
              <span className="m-budget-caption">
                {filteredTransactions.length} records
              </span>
            </div>

            {loading ? (
              <div className="m-loading">
                <div className="m-spinner" />
                <span>Loading activity...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="m-empty">
                <span className="m-empty-icon">🧾</span>
                <strong className="m-empty-title">No transactions found</strong>
                <span className="m-empty-desc">
                  Try adjusting your search criteria or add a transaction.
                </span>
              </div>
            ) : (
              <div className="m-tx-list">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === "Income";
                  const isTransfer = tx.type === "Transfer";
                  const typeClass = isIncome
                    ? "income"
                    : isTransfer
                    ? "transfer"
                    : "expense";

                  return (
                    <div className="m-tx-row" key={tx.id}>
                      <div className={`m-tx-icon ${typeClass}`}>
                        {getCategoryIcon(tx.category || tx.description)}
                      </div>

                      <div className="m-tx-info">
                        <div className="m-tx-desc">
                          {tx.description || tx.category || "Transaction"}
                        </div>
                        <div className="m-tx-meta">
                          {tx.category || tx.type}
                          {tx.account ? ` • ${tx.account}` : ""}
                          {tx.date ? ` • ${formatDate(tx.date)}` : ""}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className={`m-tx-amount ${typeClass}`}>
                          {isIncome ? "+" : isTransfer ? "" : "-"}₹
                          {Number(tx.amount || 0).toLocaleString("en-IN")}
                        </div>
                        <button
                          type="button"
                          title="Delete transaction"
                          onClick={() => handleDeleteTransaction(tx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--m-text-3)",
                            fontSize: "14px",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--m-expense)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--m-text-3)")}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {showAddForm && (
        <MobileTransactionForm
          accounts={accounts}
          onSuccess={() => loadMobileData()}
          onClose={() => {
            setShowAddForm(false);
            window.history.replaceState({}, "", "/transactions");
          }}
        />
      )}

      <MobileBottomNav onAddTransaction={() => setShowAddForm(true)} />
    </div>
  );
}

export default MobileTransactions;