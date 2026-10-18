import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MobileHeader from "../components/MobileHeader";
import MobileBalanceCard from "../components/MobileBalanceCard";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileTransactionForm from "../components/MobileTransactionForm";
import MobileAddAccountModal from "../components/MobileAddAccountModal";

import { getAccounts, getTransactions } from "../../lib/database";
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

  const totalBalance = accounts.reduce(
    (total, account) => total + Number(account.balance || 0),
    0
  );

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const monthlyBudget = accounts.reduce(
    (total, account) => total + Number(account.monthly_budget || 0),
    0
  );

  const budgetPercentage =
    monthlyBudget > 0
      ? Math.min((totalExpense / monthlyBudget) * 100, 100)
      : 0;

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
                totalIncome={totalIncome}
                totalExpense={totalExpense}
              />

              {/* Monthly Budget Tracker Card */}
              <section className="m-card">
                <div className="m-card-header">
                  <h2 className="m-card-title">Monthly Budget</h2>
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
                      <span>Spent: ₹{totalExpense.toLocaleString("en-IN")}</span>
                      <span>Limit: ₹{monthlyBudget.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="m-progress-track">
                      <div
                        className={`m-progress-fill ${budgetPercentage >= 90 ? "danger" : ""}`}
                        style={{ width: `${budgetPercentage}%` }}
                      />
                    </div>

                    <div className="m-budget-caption">
                      {budgetPercentage.toFixed(0)}% of monthly budget utilized
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
                        <div className="m-account-balance">
                          ₹{Number(account.balance || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Transactions Card */}
              <section className="m-card">
                <div className="m-card-header">
                  <h2 className="m-card-title">Recent Activity</h2>
                  <button
                    className="m-card-action"
                    onClick={() => navigate("/transactions")}
                  >
                    See All
                  </button>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="m-empty">
                    <span className="m-empty-icon">🧾</span>
                    <strong className="m-empty-title">No activity yet</strong>
                    <span className="m-empty-desc">
                      Tap the '+' button below to record your first transaction.
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