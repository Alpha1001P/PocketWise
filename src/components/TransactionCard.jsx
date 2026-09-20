import { useState } from "react";

import "./TransactionCard.css";
import TransactionModal from "./TransactionModal";
import "../styles/transactions.css";

import {
  updateTransaction,
  deleteTransaction,
  createTransaction,
} from "../lib/database";

function TransactionCard({
  transaction,
  refreshTransactions,
}) {
  const [open, setOpen] = useState(false);

  const formattedDate = new Date(
    transaction.date
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
    Other: "📦",
  };

  // ========================================
  // EDIT TRANSACTION
  // ========================================

  async function handleEdit(updatedTransaction) {
    console.log(
      "UPDATING TRANSACTION:",
      updatedTransaction
    );

    const result = await updateTransaction(
      updatedTransaction.id,
      updatedTransaction
    );

    if (result.error) {
      console.error(
        "Error updating transaction:",
        result.error
      );

      alert(
        "Could not update transaction.\n\n" +
        result.error.message
      );

      return;
    }

    console.log(
      "TRANSACTION UPDATED:",
      result.data
    );

    setOpen(false);

    if (refreshTransactions) {
      await refreshTransactions();
    }
  }

  // ========================================
  // DELETE TRANSACTION
  // ========================================

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
      return;
    }

    console.log(
      "DELETING TRANSACTION:",
      id
    );

    const result = await deleteTransaction(id);

    if (result.error) {
      console.error(
        "Error deleting transaction:",
        result.error
      );

      alert(
        "Could not delete transaction.\n\n" +
        result.error.message
      );

      return;
    }

    console.log(
      "TRANSACTION DELETED:",
      id
    );

    setOpen(false);

    if (refreshTransactions) {
      await refreshTransactions();
    }
  }

  // ========================================
  // PIN / UNPIN TRANSACTION
  // ========================================

  async function handlePin(id) {
    const updatedTransaction = {
      ...transaction,
      pinned: !transaction.pinned,
    };

    console.log(
      "PINNING TRANSACTION:",
      updatedTransaction
    );

    const result = await updateTransaction(
      id,
      updatedTransaction
    );

    if (result.error) {
      console.error(
        "Error updating pin:",
        result.error
      );

      alert(
        "Could not update pin.\n\n" +
        result.error.message
      );

      return;
    }

    setOpen(false);

    if (refreshTransactions) {
      await refreshTransactions();
    }
  }

  // ========================================
  // DUPLICATE TRANSACTION
  // ========================================

  async function handleDuplicate(transactionToDuplicate) {
    const duplicate = {
      account_id:
        transactionToDuplicate.account_id || null,

      account:
        transactionToDuplicate.account || null,

      type:
        transactionToDuplicate.type,

      amount:
        Number(transactionToDuplicate.amount) || 0,

      category:
        transactionToDuplicate.category || null,

      description:
        transactionToDuplicate.description ||
        null,

      title:
        transactionToDuplicate.title ||
        null,

      date:
        new Date().toISOString(),

      pinned: false,
    };

    console.log(
      "DUPLICATING TRANSACTION:",
      duplicate
    );

    const result = await createTransaction(
      duplicate
    );

    if (result.error) {
      console.error(
        "Error duplicating transaction:",
        result.error
      );

      alert(
        "Could not duplicate transaction.\n\n" +
        result.error.message
      );

      return;
    }

    console.log(
      "TRANSACTION DUPLICATED:",
      result.data
    );

    setOpen(false);

    if (refreshTransactions) {
      await refreshTransactions();
    }
  }

  return (
    <>
      <div className="transaction-card">

        {/* LEFT SIDE */}
        <div className="transaction-left">

          <div
            className={`transaction-icon ${
              transaction.type === "Income"
                ? "income-icon"
                : "expense-icon"
            }`}
          >
            {categoryIcons[
              transaction.category
            ] || "📦"}
          </div>

          <div className="transaction-details">

            <div className="transaction-top">

              <span
                className={`transaction-badge ${
                  transaction.type === "Income"
                    ? "income-badge"
                    : "expense-badge"
                }`}
              >
                {transaction.type}
              </span>

              {transaction.pinned && (
                <span className="pinned-chip">
                  ⭐ Pinned
                </span>
              )}

            </div>

            <h3>
              {transaction.title ||
                transaction.description ||
                transaction.category ||
                "Transaction"}
            </h3>

            <div className="transaction-meta">

              <span className="category-chip">
                {categoryIcons[
                  transaction.category
                ] || "📦"}{" "}
                {transaction.category ||
                  "Other"}
              </span>

              <span className="account-chip">
                💳{" "}
                {transaction.account ||
                  "Account"}
              </span>

            </div>

            <small className="transaction-date">
              📅 {formattedDate}
            </small>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="transaction-right">

          <h2
            className={
              transaction.type === "Income"
                ? "income-text"
                : "expense-text"
            }
          >
            {transaction.type === "Income"
              ? "+"
              : "-"}
            ₹
            {Number(
              transaction.amount || 0
            ).toLocaleString("en-IN")}
          </h2>

          <button
            className="menu-btn"
            onClick={() => setOpen(true)}
          >
            ⋮
          </button>

        </div>

      </div>

      {/* TRANSACTION MENU */}
      {open && (
        <TransactionModal
          transaction={transaction}
          close={() => setOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={handlePin}
          onDuplicate={handleDuplicate}
        />
      )}
    </>
  );
}

export default TransactionCard;