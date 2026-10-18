import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileHeader from "../components/MobileHeader";
import MobileBalanceCard from "../components/MobileBalanceCard";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileTransactionForm from "../components/MobileTransactionForm";
import MobileAddAccountModal from "../components/MobileAddAccountModal";

import { getAccounts, getTransactions, deleteAccount } from "../../lib/database";
import { getCategoryIcon } from "../../utils/categoryDetector";

import "../styles/mobile.css";

function MobileDashboard() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const [accountsResult, transactionsResult] = await Promise.all([
      getAccounts(),
      getTransactions(),
    ]);

    if (accountsResult.data) {
      setAccounts(accountsResult.data);
    }

    if (transactionsResult.data) {
      setTransactions(transactionsResult.data);
    }

    setLoading(false);
  }

  async function handleDeleteAccount(account) {
    if (!window.confirm(`Are you sure you want to delete "${account.name}"?`)) {
      return;
    }

    const { error } = await deleteAccount(account.id);
    if (error) {
      alert(error.message || "Failed to delete account.");
      return;
    }

    loadDashboard();
  }

  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance || 0),
    0
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Scope to Current Month only
  const currentMonthTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "Income")
    .reduce((total, t) => total + Number(t.amount || 0), 0);

  const currentMonthExpense = currentMonthTransactions
    .filter((t) => t.type === "Expense")
    .reduce((total, t) => total + Number(t.amount || 0), 0);

  const recentTransactions = [...currentMonthTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const monthlyBudget = accounts.reduce(
    (total, account) => total + Number(account.monthly_budget || 0),
    0
  );

  const budgetPercentage =
    monthlyBudget > 0
      ? Math.min((currentMonthExpense / monthlyBudget) * 100, 100)
      : 0;

  const currentMonthName = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="mobile-app">
      <div className="mobile-page">
        <MobileHeader
          title="PocketWise"
          subtitle="Smart money overview"
          initial="P"
        />

        <main className="m-content">
          {loading ? (
            <div className="m-loading">
              <div className="m-spinner" />
              <span>Loading your finances...</span>
            </div>
          ) : (
            <>
              {/* Hero Net Worth Card */}
              <MobileBalanceCard
                balance={totalBalance}
                totalIncome={currentMonthIncome}
                totalExpense={currentMonthExpense}
              />

              {/* Monthly Budget Tracker Card */}
              <section className="m-card">
                <div className="m-card-header">
                  <div>
                    <h2 className="m-card-title">{currentMonthName} Budget</h2>
                    <span style={{ fontSize: "11px", color: "var(--m-text-3)", fontWeight: "500" }}>
                      Resets automatically on the 1st
                    </span>
                  </div>
                  <button
                    className="m-card-action"
                    onClick={() => navigate("/budget")}
                  >
                    Manage
                  </button>
                </div>

                {monthlyBudget > 0 ? (
                  <>
                    <div className="m-budget-row">
                      <span>Spent: ₹{currentMonthExpense.toLocaleString("en-IN")}</span>
                      <span>Limit: ₹{monthlyBudget.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="m-progress-track">
                      <div
                        className={`m-progress-fill ${budgetPercentage >= 90 ? "danger" : ""}`}
                        style={{ width: `${budgetPercentage}%` }}
                      />
                    </div>

                    <div className="m-budget-caption">
                      {budgetPercentage.toFixed(0)}% of {currentMonthName} budget utilized
                    </div>
                  </>
                ) : (
                  <div className="m-empty" style={{ padding: "16px 0" }}>
                    <span className="m-empty-icon" style={{ fontSize: "28px" }}>🎯</span>
                    <strong className="m-empty-title">No budget set</strong>
                    <span className="m-empty-desc">
                      Configure account limits to track monthly expenditures.
                    </span>
                    <button
                      className="m-btn m-btn-primary m-btn-sm"
                      style={{ marginTop: "6px" }}
                      onClick={() => navigate("/budget")}
                    >
                      Set Budget
                    </button>
                  </div>
                )}
              </section>

              {/* Accounts Card */}
              <section className="m-card">
                <div className="m-card-header">
                  <h2 className="m-card-title">Accounts ({accounts.length})</h2>
                  <button
                    type="button"
                    className="m-card-action"
                    onClick={() => setShowAddAccount(true)}
                  >
                    + Add Account
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <div className="m-empty">
                    <span className="m-empty-icon">💳</span>
                    <strong className="m-empty-title">No accounts added</strong>
                    <span className="m-empty-desc">Add checking, cash or savings accounts.</span>
                    <button
                      type="button"
                      className="m-btn m-btn-primary m-btn-sm"
                      style={{ marginTop: "8px" }}
                      onClick={() => setShowAddAccount(true)}
                    >
                      + Add Your First Account
                    </button>
                  </div>
                ) : (
                  <div className="m-account-list">
                    {accounts.map((account) => (
                      <div className="m-account-row" key={account.id}>
                        <div className="m-account-icon">
                          {account.icon || "💳"}
                        </div>
                        <div className="m-account-info">
                          <div className="m-account-name">{account.name}</div>
                          <div className="m-account-type">{account.type || "Standard"}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="m-account-balance">
                            ₹{Number(account.balance || 0).toLocaleString("en-IN")}
                          </div>
                          <button
                            type="button"
                            title="Delete Account"
                            onClick={() => handleDeleteAccount(account)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--m-text-3)",
                              fontSize: "15px",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "6px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--m-expense)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--m-text-3)")}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Transactions Card (Scoped to current month) */}
              <section className="m-card">
                <div className="m-card-header">
                  <div>
                    <h2 className="m-card-title">{currentMonthName} Activity</h2>
                    <span style={{ fontSize: "11px", color: "var(--m-text-3)", fontWeight: "500" }}>
                      Showing latest for this month
                    </span>
                  </div>
                  <button
                    className="m-card-action"
                    onClick={() => navigate("/transactions")}
                  >
                    All History
                  </button>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="m-empty">
                    <span className="m-empty-icon">🧾</span>
                    <strong className="m-empty-title">No transactions in {currentMonthName}</strong>
                    <span className="m-empty-desc">
                      Previous months' records are archived in Reports and Transactions.
                    </span>
                  </div>
                ) : (
                  <div className="m-tx-list">
                    {recentTransactions.map((tx) => {
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
                            </div>
                          </div>
                          <div className={`m-tx-amount ${typeClass}`}>
                            {isIncome ? "+" : isTransfer ? "" : "-"}₹
                            {Number(tx.amount || 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {showAddForm && (
        <MobileTransactionForm
          accounts={accounts}
          onSuccess={() => loadDashboard()}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <MobileAddAccountModal
        isOpen={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onSuccess={() => loadDashboard()}
      />

      <MobileBottomNav onAddTransaction={() => setShowAddForm(true)} />
    </div>
  );
}

export default MobileDashboard;