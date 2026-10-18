import { useState } from "react";
import AccountModal from "./AccountModal";
import AccountMenu from "./AccountMenu";

function AccountSelector({
  accounts,
  selectedAccount,
  setSelectedAccount,
  addAccount,
  updateAccount,
  deleteAccount,
}) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  function saveAccount(account) {
    if (editingAccount) {
      updateAccount(account);
    } else {
      addAccount(account);
    }

    // Select the account automatically
    setSelectedAccount(account.name);

    setEditingAccount(null);
    setShowModal(false);
    setOpen(false);
  }

  return (
    <div className="account-selector">

      <label>Account</label>

      <div
        className="account-select"
        onClick={() => setOpen(!open)}
      >
        <span>
          {selectedAccount || "Select Account"}
        </span>

        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="account-dropdown">

          {accounts.length === 0 && (
            <div className="empty-account">
              No accounts available
            </div>
          )}

          {accounts.map((account) => (
            <div
              key={account.id}
              className="account-item"
            >

              <div
                className="account-name"
                onClick={() => {
                  setSelectedAccount(account.name);
                  setOpen(false);
                }}
              >
                <span>
                  {account.icon || "🏦"}{" "}
                  {account.name}
                </span>
              </div>

              <div className="account-right">

                <span className="account-balance">
                  ₹{account.balance}
                </span>

                <button
                  type="button"
                  className="account-menu"
                  onClick={(e) => {
                    e.stopPropagation();

                    setMenuOpen(
                      menuOpen === account.id
                        ? null
                        : account.id
                    );
                  }}
                >
                  ⋮
                </button>

                {menuOpen === account.id && (
                  <AccountMenu
                    onEdit={() => {
                      setEditingAccount(account);
                      setShowModal(true);
                      setMenuOpen(null);
                    }}
                    onDelete={() => {
                      if (
                        window.confirm(
                          `Delete "${account.name}"?`
                        )
                      ) {
                        deleteAccount(account.id);
                      }

                      setMenuOpen(null);
                    }}
                  />
                )}

              </div>

            </div>
          ))}

          <div
            className="add-account"
            onClick={() => {
              setEditingAccount(null);
              setShowModal(true);
            }}
          >
            ➕ Add New Account
          </div>

        </div>
      )}

      <AccountModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAccount(null);
        }}
        onSave={saveAccount}
        editingAccount={editingAccount}
        accounts={accounts}
      />

    </div>
  );
}

export default AccountSelector;