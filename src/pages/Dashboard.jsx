import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../styles/layout.css";
import "../components/dashboard/dashboard.css";
import "../styles/dashboard.css";
import "../styles/navbar.css";
import "../components/TransactionModal.css";
import "../styles/modals.css";

import ManageBudgetModal from "../components/dashboard/ManageBudgetModal";
import TransactionForm from "../components/TransactionForm";
import BudgetCard from "../components/dashboard/BudgetCard";
import AccountsSection from "../components/dashboard/AccountsSection";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import SpendingTrendChart from "../components/charts/SpendingTrendChart";
import DashboardFooter from "../components/dashboard/DashboardFooter";
import AddAccountModal from "../components/AddAccountModal";
import EditAccountModal from "../components/EditAccountModal";

import { getBudget, saveBudget } from "../utils/budget";

import {
  getAccounts,
  createAccount,
  updateAccount as updateAccountDB,
  deleteAccount as deleteAccountDB,
  getTransactions,
  createTransaction,
  updateTransaction as updateTransactionDB,
  deleteTransaction as deleteTransactionDB,
} from "../lib/database";

// ========================================
// HELPERS
// ========================================

function normalizeAccount(account) {
  return {
    ...account,
    monthlyBudget: Number(
      account.monthlyBudget ??
        account.monthly_budget ??
        0
    ),
    balance: Number(account.balance || 0),
  };
}

function normalizeTransaction(transaction) {
  return {
    ...transaction,
    amount: Number(transaction.amount || 0),
  };
}

// ========================================
// DASHBOARD
// ========================================

function Dashboard() {
  const navigate = useNavigate();

  const [trendView, setTrendView] = useState("Month");

  const [showBudgetModal, setShowBudgetModal] =
    useState(false);

  // ========================================
  // ACCOUNTS
  // ========================================

  const [accounts, setAccounts] = useState([]);

  const [showAddAccount, setShowAddAccount] =
    useState(false);

  const [editingAccount, setEditingAccount] =
    useState(null);

  // ========================================
  // TRANSACTIONS
  // ========================================

  const [transactions, setTransactions] =
    useState([]);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  // ========================================
  // LOAD ACCOUNTS + TRANSACTIONS
  // ========================================

  useEffect(() => {
    async function loadData() {
      // ------------------------------------
      // LOAD ACCOUNTS
      // ------------------------------------

      const accountsResult = await getAccounts();

      if (accountsResult.error) {
        console.error(
          "Error loading accounts:",
          accountsResult.error
        );
      } else {
        const loadedAccounts =
          (accountsResult.data || []).map(
            normalizeAccount
          );

        setAccounts(loadedAccounts);
      }

      // ------------------------------------
      // LOAD TRANSACTIONS
      // ------------------------------------

      const transactionsResult =
        await getTransactions();

      if (transactionsResult.error) {
        console.error(
          "Error loading transactions:",
          transactionsResult.error
        );
      } else {
        const loadedTransactions =
          (transactionsResult.data || []).map(
            normalizeTransaction
          );

        setTransactions(loadedTransactions);
      }
    }

    loadData();
  }, []);

  // ========================================
  // TRANSACTION - ADD
  // ========================================

  async function addTransaction(transaction) {
    const { data, error } =
      await createTransaction(transaction);

    if (error) {
      console.error(
        "Error creating transaction:",
        error
      );

      alert(
        "Could not save the transaction. Please try again."
      );

      return;
    }

    if (data) {
      setTransactions((prev) => [
        normalizeTransaction(data),
        ...prev,
      ]);
    }

    setShowTransactionModal(false);
  }

  // ========================================
  // TRANSACTION - UPDATE
  // ========================================

  async function updateTransaction(
    updatedTransaction
  ) {
    const { data, error } =
      await updateTransactionDB(
        updatedTransaction.id,
        updatedTransaction
      );

    if (error) {
      console.error(
        "Error updating transaction:",
        error
      );

      alert(
        "Could not update the transaction. Please try again."
      );

      return;
    }

    if (data) {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === updatedTransaction.id
            ? normalizeTransaction(data)
            : transaction
        )
      );
    }

    setEditingTransaction(null);
    setShowTransactionModal(false);
  }

  // ========================================
  // TRANSACTION - DELETE
  // ========================================

  async function deleteTransaction(id) {
    const { error } =
      await deleteTransactionDB(id);

    if (error) {
      console.error(
        "Error deleting transaction:",
        error
      );

      alert(
        "Could not delete the transaction. Please try again."
      );

      return;
    }

    setTransactions((prev) =>
      prev.filter(
        (transaction) =>
          transaction.id !== id
      )
    );
  }

  // ========================================
  // ACCOUNT - DELETE
  // ========================================

  async function deleteAccount(id) {
    const { error } =
      await deleteAccountDB(id);

    if (error) {
      console.error(
        "Error deleting account:",
        error
      );

      alert(
        "Could not delete the account. Please try again."
      );

      return;
    }

    setAccounts((prev) =>
      prev.filter(
        (account) =>
          account.id !== id
      )
    );
  }

  // ========================================
  // ACCOUNT - UPDATE
  // ========================================

  async function updateAccount(
    updatedAccount
  ) {
    const { data, error } =
      await updateAccountDB(
        updatedAccount.id,
        updatedAccount
      );

    if (error) {
      console.error(
        "Error updating account:",
        error
      );

      alert(
        "Could not update the account. Please try again."
      );

      return;
    }

    if (data) {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === updatedAccount.id
            ? normalizeAccount(data)
            : account
        )
      );
    }

    setEditingAccount(null);
  }

  // ========================================
  // SAVE ACCOUNT BUDGETS
  // ========================================

  async function saveBudgets(
    updatedAccounts
  ) {
    try {
      const updated = [];

      for (const account of updatedAccounts) {
        const { data, error } =
          await updateAccountDB(
            account.id,
            account
          );

        if (error) {
          console.error(
            "Error saving account budget:",
            error
          );

          continue;
        }

        if (data) {
          updated.push(
            normalizeAccount(data)
          );
        }
      }

      if (updated.length > 0) {
        setAccounts((prev) =>
          prev.map((account) => {
            const updatedAccount =
              updated.find(
                (item) =>
                  item.id === account.id
              );

            return (
              updatedAccount ||
              account
            );
          })
        );
      }
    } catch (error) {
      console.error(
        "Budget save error:",
        error
      );
    }

    setShowBudgetModal(false);
  }

  // ========================================
  // RESET MONTHLY BUDGET
  // ========================================

  async function resetMonthlyBudget(
    scopeAccountId = "overall"
  ) {
    if (scopeAccountId === "overall") {
      const updatedAccounts =
        accounts.map((account) => ({
          ...account,
          monthlyBudget: 0,
        }));

      await saveBudgets(
        updatedAccounts
      );

      saveBudget({
        ...getBudget(),
        monthly: 0,
      });

      return;
    }

    const updatedAccounts =
      accounts.map((account) =>
        String(account.id) ===
        String(scopeAccountId)
          ? {
              ...account,
              monthlyBudget: 0,
            }
          : account
      );

    await saveBudgets(
      updatedAccounts
    );
  }

  // ========================================
  // RESET MONTHLY EXPENSES
  // ========================================

  async function resetMonthlyExpenses(
    scopeAccountId = "overall"
  ) {
    const currentMonth =
      new Date().getMonth();

    const currentYear =
      new Date().getFullYear();

    const transactionsToDelete =
      transactions.filter(
        (transaction) => {
          if (
            transaction.type !==
            "Expense"
          ) {
            return false;
          }

          const date =
            new Date(
              transaction.date
            );

          const isCurrentMonth =
            date.getMonth() ===
              currentMonth &&
            date.getFullYear() ===
              currentYear;

          if (!isCurrentMonth) {
            return false;
          }

          if (
            scopeAccountId ===
            "overall"
          ) {
            return true;
          }

          const targetAccount =
            accounts.find(
              (account) =>
                String(account.id) ===
                String(
                  scopeAccountId
                )
            );

          return targetAccount
            ? transaction.account ===
                targetAccount.name
            : false;
        }
      );

    for (
      const transaction of
      transactionsToDelete
    ) {
      await deleteTransaction(
        transaction.id
      );
    }
  }

  // ========================================
  // RESET EVERYTHING
  // ========================================

  async function resetMonthlyAll(
    scopeAccountId = "overall"
  ) {
    await resetMonthlyBudget(
      scopeAccountId
    );

    await resetMonthlyExpenses(
      scopeAccountId
    );
  }

  // ========================================
  // TOTAL BALANCE
  // ========================================

  const totalBalance =
    accounts.reduce(
      (sum, account) => {
        const balance =
          transactions.reduce(
            (
              total,
              transaction
            ) => {
              if (
                transaction.account !==
                account.name
              ) {
                return total;
              }

              if (
                transaction.type ===
                "Income"
              ) {
                return (
                  total +
                  Number(
                    transaction.amount
                  )
                );
              }

              return (
                total -
                Number(
                  transaction.amount
                )
              );
            },
            Number(
              account.balance || 0
            )
          );

        return sum + balance;
      },
      0
    );

  // ========================================
  // MONTHLY BUDGET
  // ========================================

  const budgetData = getBudget();

  const monthlyBudget =
    Number(
      budgetData.monthly || 0
    );

  // ========================================
  // CURRENT MONTH
  // ========================================

  const currentMonth =
    new Date().getMonth();

  const currentYear =
    new Date().getFullYear();

  // ========================================
  // TOTAL EXPENSE
  // ========================================

  const totalExpense =
    transactions
      .filter((item) => {
        if (
          item.type !==
          "Expense"
        ) {
          return false;
        }

        const date =
          new Date(item.date);

        return (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );
      })
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount
          ),
        0
      );

  // ========================================
  // BUDGET CALCULATIONS
  // ========================================

  const remaining =
    monthlyBudget -
    totalExpense;

  const remainingPercentage =
    monthlyBudget > 0
      ? Math.max(
          0,
          Math.round(
            (remaining /
              monthlyBudget) *
              100
          )
        )
      : 0;

  const exceeded =
    totalExpense >
    monthlyBudget;

  const exceededAmount =
    totalExpense -
    monthlyBudget;

  // ========================================
  // AI INSIGHTS
  // ========================================

  const expenseTransactions =
    transactions.filter(
      (transaction) => {
        if (
          transaction.type !==
          "Expense"
        ) {
          return false;
        }

        const date =
          new Date(
            transaction.date
          );

        return (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );
      }
    );

  const incomeTransactions =
    transactions.filter(
      (transaction) => {
        if (
          transaction.type !==
          "Income"
        ) {
          return false;
        }

        const date =
          new Date(
            transaction.date
          );

        return (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );
      }
    );

  const aiInsights = [];

  // Highest Spending Category

  const categoryTotals = {};

  expenseTransactions.forEach(
    (transaction) => {
      const category =
        transaction.category ||
        "Other";

      categoryTotals[
        category
      ] =
        (categoryTotals[
          category
        ] || 0) +
        Number(
          transaction.amount
        );
    }
  );

  const highestCategory =
    Object.entries(
      categoryTotals
    ).sort(
      (a, b) =>
        b[1] - a[1]
    )[0];

  if (highestCategory) {
    aiInsights.push(
      `💡 ${highestCategory[0]} is your highest spending category (₹${highestCategory[1].toLocaleString(
        "en-IN"
      )}).`
    );
  }

  // Budget

  if (monthlyBudget > 0) {
    if (exceeded) {
      aiInsights.push(
        `⚠️ You've exceeded your monthly budget by ₹${exceededAmount.toLocaleString(
          "en-IN"
        )}.`
      );
    } else {
      aiInsights.push(
        `🎯 You still have ₹${remaining.toLocaleString(
          "en-IN"
        )} remaining this month.`
      );
    }
  }

  // Expense Count

  if (
    expenseTransactions.length >
    0
  ) {
    aiInsights.push(
      `📈 You've recorded ${expenseTransactions.length} expense transactions this month.`
    );
  }

  // Income

  if (
    incomeTransactions.length ===
    0
  ) {
    aiInsights.push(
      "💰 No income has been recorded this month."
    );
  } else {
    const latestIncome =
      incomeTransactions[0];

    aiInsights.push(
      `💵 Latest income: ₹${Number(
        latestIncome.amount
      ).toLocaleString(
        "en-IN"
      )} via ${
        latestIncome.account ||
        "account"
      }.`
    );
  }

  // Most Used Account

  const accountTotals = {};

  transactions.forEach(
    (transaction) => {
      if (
        !transaction.account
      ) {
        return;
      }

      accountTotals[
        transaction.account
      ] =
        (accountTotals[
          transaction.account
        ] || 0) + 1;
    }
  );

  const favouriteAccount =
    Object.entries(
      accountTotals
    ).sort(
      (a, b) =>
        b[1] - a[1]
    )[0];

  if (favouriteAccount) {
    aiInsights.push(
      `🏦 ${favouriteAccount[0]} is your most-used account.`
    );
  }

  // Weekend Spending

  const weekendExpenses =
    expenseTransactions.filter(
      (transaction) => {
        const day =
          new Date(
            transaction.date
          ).getDay();

        return (
          day === 0 ||
          day === 6
        );
      }
    );

  if (
    weekendExpenses.length >
      expenseTransactions.length /
        2 &&
    expenseTransactions.length >
      4
  ) {
    aiInsights.push(
      "📅 Most of your spending happens during weekends."
    );
  }

  // Healthy Spending

  if (
    !exceeded &&
    remainingPercentage >=
      50
  ) {
    aiInsights.push(
      "✅ Great job! You're managing your budget well."
    );
  }

  if (
    aiInsights.length ===
    0
  ) {
    aiInsights.push(
      "Start adding transactions to unlock AI insights."
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar
          onAddTransaction={() => {
            setEditingTransaction(
              null
            );

            setShowTransactionModal(
              true
            );
          }}
        />

        <div className="dashboard-wrapper">

          <BudgetCard
            accounts={accounts}
            transactions={
              transactions
            }
            onManageBudget={() =>
              setShowBudgetModal(
                true
              )
            }
            onResetBudget={
              resetMonthlyBudget
            }
            onResetExpenses={
              resetMonthlyExpenses
            }
            onResetAll={
              resetMonthlyAll
            }
          />

          <section className="summary-row">

            <AccountsSection
              accounts={accounts}
              transactions={
                transactions
              }
              totalBalance={
                totalBalance
              }
              onAddAccount={() =>
                setShowAddAccount(
                  true
                )
              }
              onEditAccount={
                setEditingAccount
              }
              onDeleteAccount={
                deleteAccount
              }
            />

          </section>

          <section className="dashboard-trend-card">

            <div className="trend-header">

              <div>
                <h2>
                  Spending Trend
                </h2>

                <p>
                  Visualize your expenses over time
                </p>
              </div>

              <div className="trend-tabs">

                <button
                  className={
                    trendView ===
                    "Week"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setTrendView(
                      "Week"
                    )
                  }
                >
                  Week
                </button>

                <button
                  className={
                    trendView ===
                    "Month"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setTrendView(
                      "Month"
                    )
                  }
                >
                  Month
                </button>

                <button
                  className={
                    trendView ===
                    "Year"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setTrendView(
                      "Year"
                    )
                  }
                >
                  Year
                </button>

              </div>

            </div>

            <SpendingTrendChart
              transactions={
                transactions
              }
              trendView={
                trendView
              }
            />

          </section>

          <RecentTransactions
            transactions={
              transactions
            }
            onEdit={(
              transaction
            ) => {
              setEditingTransaction(
                transaction
              );

              setShowTransactionModal(
                true
              );
            }}
            onDelete={
              deleteTransaction
            }
            onViewAll={() =>
              navigate(
                "/transactions"
              )
            }
          />

          <ManageBudgetModal
            open={
              showBudgetModal
            }
            accounts={
              accounts
            }
            onClose={() =>
              setShowBudgetModal(
                false
              )
            }
            onSave={
              saveBudgets
            }
          />

          <DashboardFooter />

          {showTransactionModal && (
            <div className="modal-overlay">

              <TransactionForm
                accounts={
                  accounts
                }
                editingTransaction={
                  editingTransaction
                }
                onAdd={
                  addTransaction
                }
                onUpdate={
                  updateTransaction
                }
                onClose={() => {
                  setShowTransactionModal(
                    false
                  );

                  setEditingTransaction(
                    null
                  );
                }}
              />

            </div>
          )}

          {showAddAccount && (
            <AddAccountModal
              onClose={() =>
                setShowAddAccount(
                  false
                )
              }
              onCreate={async (
                newAccount
              ) => {
                const {
                  data,
                  error,
                } =
                  await createAccount(
                    newAccount
                  );

                if (error) {
                  console.error(
                    "Error creating account:",
                    error
                  );

                  alert(
                    "Could not save the account. Please try again."
                  );

                  return;
                }

                if (data) {
                  setAccounts(
                    (prev) => [
                      ...prev,
                      normalizeAccount(
                        data
                      ),
                    ]
                  );
                }

                setShowAddAccount(
                  false
                );
              }}
            />
          )}

          {editingAccount && (
            <EditAccountModal
              account={
                editingAccount
              }
              onClose={() =>
                setEditingAccount(
                  null
                )
              }
              onSave={
                updateAccount
              }
            />
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;