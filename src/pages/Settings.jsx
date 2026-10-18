import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import TransactionForm from "../components/transactions/TransactionForm";

import "../styles/settings.css";
import "../components/transactions/TransactionModal.css";

function Settings() {
  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  const [currency, setCurrency] = useState("INR");

  const [notifications, setNotifications] = useState(true);

  const [profile, setProfile] = useState({
    name: "Loading...",
    email: "",
  });

  const [editing, setEditing] = useState(false);

  const [accounts, setAccounts] = useState([]);

  // --------------------------------------------------
  // LOAD USER / SETTINGS / ACCOUNTS
  // --------------------------------------------------

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const googleName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "PocketWise User";

      setProfile({
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          googleName,
        email: user.email || "",
      });

      // Load user settings from Supabase
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsData) {
        setCurrency(settingsData.currency || "INR");

        setNotifications(
          settingsData.notifications_enabled !== false
        );
      }

      // Load accounts from Supabase
      const { data: accountData, error: accountError } =
        await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          });

      if (accountError) {
        console.error(
          "Settings account loading error:",
          accountError
        );
      }

      setAccounts(accountData || []);
    }

    loadData();
  }, []);

  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------

  function saveProfile() {
    setEditing(false);
  }

  // --------------------------------------------------
  // SAVE USER SETTINGS
  // --------------------------------------------------

  async function saveSettings(changes = {}) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          monthly_budget: changes.monthly_budget ?? undefined,
          currency:
            changes.currency !== undefined
              ? changes.currency
              : currency,
          notifications_enabled:
            changes.notifications_enabled !== undefined
              ? changes.notifications_enabled
              : notifications,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error(
        "Settings save error:",
        error
      );
    }
  }

  async function changeCurrency(value) {
    setCurrency(value);

    await saveSettings({
      currency: value,
    });
  }

  async function changeNotifications(value) {
    setNotifications(value);

    await saveSettings({
      notifications_enabled: value,
    });
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      alert(
        "Logout failed. Please try again."
      );

      return;
    }

    window.location.href = "/login";
  }

  // --------------------------------------------------
  // RESET DATA
  // --------------------------------------------------

  async function resetData() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all PocketWise transactions and accounts? This cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error: transactionError } =
      await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user.id);

    if (transactionError) {
      console.error(
        "Transaction reset error:",
        transactionError
      );

      alert(
        "Unable to delete transactions."
      );

      return;
    }

    const { error: accountError } =
      await supabase
        .from("accounts")
        .delete()
        .eq("user_id", user.id);

    if (accountError) {
      console.error(
        "Account reset error:",
        accountError
      );

      alert(
        "Transactions were deleted, but accounts could not be deleted."
      );

      return;
    }

    setAccounts([]);

    alert(
      "All PocketWise financial data was deleted successfully."
    );

    window.location.reload();
  }

  // --------------------------------------------------
  // CSV HELPERS
  // --------------------------------------------------

  function escapeCSVValue(value) {
    const text = String(value ?? "");

    if (
      text.includes(",") ||
      text.includes('"') ||
      text.includes("\n")
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  }

  // --------------------------------------------------
  // EXPORT SUPABASE TRANSACTIONS
  // --------------------------------------------------

  async function exportCSV() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    const {
      data: transactions,
      error,
    } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", {
        ascending: false,
      });

    if (error) {
      console.error(
        "CSV export error:",
        error
      );

      alert(
        "Unable to export transactions."
      );

      return;
    }

    if (!transactions || transactions.length === 0) {
      alert(
        "No transactions available."
      );

      return;
    }

    // Export in the same format as your old PocketWise CSV
    const headers = [
      "id",
      "title",
      "amount",
      "type",
      "category",
      "account",
      "date",
      "pinned",
    ];

    const rows = transactions.map(
      (transaction) => [
        transaction.id,
        transaction.description ||
          transaction.title ||
          "",
        transaction.amount,
        transaction.type,
        transaction.category || "",
        transaction.account || "",
        transaction.date || "",
        transaction.pinned ?? false,
      ]
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map(escapeCSVValue)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "PocketWise_Transactions.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------
  // CSV PARSER
  // --------------------------------------------------

  function parseCSVLine(line) {
    const values = [];

    let current = "";
    let insideQuotes = false;

    for (
      let i = 0;
      i < line.length;
      i++
    ) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (
        char === '"' &&
        insideQuotes &&
        nextChar === '"'
      ) {
        current += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (
        char === "," &&
        !insideQuotes
      ) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());

    return values;
  }

  // --------------------------------------------------
  // IMPORT CSV → SUPABASE
  // --------------------------------------------------

  async function importCSV(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      alert(
        "Please select a CSV file."
      );

      event.target.value = "";

      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;

        const lines = text
          .split(/\r?\n/)
          .filter(
            (line) =>
              line.trim() !== ""
          );

        if (lines.length < 2) {
          alert(
            "The CSV file does not contain any transactions."
          );

          event.target.value = "";

          return;
        }

        const headers =
          parseCSVLine(lines[0]).map(
            (header) =>
              header
                .trim()
                .toLowerCase()
        );

        const importedTransactions =
          lines
            .slice(1)
            .map((line) => {
              const values =
                parseCSVLine(line);

              const transaction = {};

              headers.forEach(
                (header, index) => {
                  transaction[header] =
                    values[index] ?? "";
                }
              );

              return transaction;
            })
            .filter(
              (transaction) =>
                Object.values(
                  transaction
                ).some(
                  (value) =>
                    String(value).trim() !==
                    ""
                )
            );

        if (
          importedTransactions.length ===
          0
        ) {
          alert(
            "No valid transactions found in the CSV."
          );

          event.target.value = "";

          return;
        }

        // --------------------------------------------
        // CURRENT USER
        // --------------------------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          alert(
            "Please log in before importing data."
          );

          event.target.value = "";

          return;
        }

        // --------------------------------------------
        // LOAD EXISTING ACCOUNTS
        // --------------------------------------------

        const {
          data: existingAccounts,
          error: accountLoadError,
        } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id);

        if (accountLoadError) {
          console.error(
            "Account loading error:",
            accountLoadError
          );

          alert(
            "Unable to load your accounts."
          );

          event.target.value = "";

          return;
        }

        const accountMap = new Map();

        (
          existingAccounts || []
        ).forEach((account) => {
          accountMap.set(
            String(account.name)
              .trim()
              .toLowerCase(),
            account
          );
        });

        // --------------------------------------------
        // FIND / CREATE ACCOUNTS
        // --------------------------------------------

        const accountNames = [
          ...new Set(
            importedTransactions
              .map(
                (transaction) =>
                  String(
                    transaction.account ||
                      "Cash Wallet"
                  ).trim()
              )
              .filter(Boolean)
          ),
        ];

        for (
          const accountName of accountNames
        ) {
          const accountKey =
            accountName.toLowerCase();

          if (
            accountMap.has(accountKey)
          ) {
            continue;
          }

          const {
            data: newAccount,
            error: createAccountError,
          } = await supabase
            .from("accounts")
            .insert([
              {
                user_id: user.id,
                name: accountName,
                type:
                  accountName
                    .toLowerCase() ===
                  "cash wallet"
                    ? "Cash"
                    : "Bank",
                balance: 0,
                icon:
                  accountName
                    .toLowerCase() ===
                  "cash wallet"
                    ? "💵"
                    : "🏦",
                monthly_budget: 0,
              },
            ])
            .select()
            .single();

          if (createAccountError) {
            console.error(
              "Account creation error:",
              createAccountError
            );

            alert(
              `Unable to create account "${accountName}".`
            );

            event.target.value = "";

            return;
          }

          accountMap.set(
            accountKey,
            newAccount
          );
        }

        // --------------------------------------------
        // LOAD EXISTING TRANSACTIONS
        // --------------------------------------------

        const {
          data: existingTransactions,
          error: transactionLoadError,
        } = await supabase
          .from("transactions")
          .select(
            "id, account_id, account, type, amount, category, description, date"
          )
          .eq("user_id", user.id);

        if (transactionLoadError) {
          console.error(
            "Transaction loading error:",
            transactionLoadError
          );

          alert(
            "Unable to check existing transactions."
          );

          event.target.value = "";

          return;
        }

        // --------------------------------------------
        // PREVENT DUPLICATES
        // --------------------------------------------

        const existingKeys =
          new Set(
            (
              existingTransactions ||
              []
            ).map((transaction) =>
              [
                transaction.description ||
                  "",
                Number(
                  transaction.amount
                ),
                transaction.type ||
                  "",
                transaction.category ||
                  "",
                transaction.account ||
                  "",
                transaction.date ||
                  "",
              ].join("|")
            )
          );

        const rowsToInsert = [];

        let duplicateCount = 0;

        importedTransactions.forEach(
          (oldTransaction) => {
            const title =
              String(
                oldTransaction.title ||
                  oldTransaction.description ||
                  oldTransaction.note ||
                  "Transaction"
              ).trim();

            const amount = Number(
              String(
                oldTransaction.amount ||
                  "0"
              ).replace(/,/g, "")
            );

            const type =
              String(
                oldTransaction.type ||
                  "Expense"
              ).trim();

            const category =
              String(
                oldTransaction.category ||
                  "Other"
              ).trim();

            const accountName =
              String(
                oldTransaction.account ||
                  "Cash Wallet"
              ).trim();

            const date =
              oldTransaction.date
                ? String(
                    oldTransaction.date
                  ).trim()
                : new Date().toISOString();

            if (
              !Number.isFinite(amount) ||
              amount <= 0
            ) {
              return;
            }

            const account =
              accountMap.get(
                accountName.toLowerCase()
              );

            const duplicateKey =
              [
                title,
                amount,
                type,
                category,
                accountName,
                date,
              ].join("|");

            if (
              existingKeys.has(
                duplicateKey
              )
            ) {
              duplicateCount++;
              return;
            }

            existingKeys.add(
              duplicateKey
            );

            rowsToInsert.push({
              user_id: user.id,

              account_id:
                account?.id || null,

              account:
                accountName,

              type,

              amount,

              category,

              // Old CSV "title" becomes
              // Supabase "description"
              description: title,

              date,
            });
          }
        );

        if (
          rowsToInsert.length === 0
        ) {
          alert(
            duplicateCount > 0
              ? `All ${duplicateCount} transaction(s) are already in Supabase.`
              : "No valid transactions found to import."
          );

          event.target.value = "";

          return;
        }

        // --------------------------------------------
        // INSERT INTO SUPABASE
        // --------------------------------------------

        const {
          error: insertError,
        } = await supabase
          .from("transactions")
          .insert(rowsToInsert);

        if (insertError) {
          console.error(
            "Supabase CSV import error:",
            insertError
          );

          alert(
            `Import failed: ${insertError.message}`
          );

          event.target.value = "";

          return;
        }

        // --------------------------------------------
        // SUCCESS
        // --------------------------------------------

        alert(
          `✅ ${rowsToInsert.length} transaction(s) imported successfully${
            duplicateCount > 0
              ? `\n\n${duplicateCount} duplicate transaction(s) were skipped.`
              : "."
          }`
        );

        event.target.value = "";

        // Reload so Dashboard/Reports/etc.
        // immediately use the new Supabase data.
        window.location.reload();
      } catch (error) {
        console.error(
          "CSV import error:",
          error
        );

        alert(
          "Unable to import the CSV file."
        );

        event.target.value = "";
      }
    };

    reader.onerror = () => {
      alert(
        "Unable to read the CSV file."
      );

      event.target.value = "";
    };

    reader.readAsText(file);
  }

  // --------------------------------------------------
  // ADD TRANSACTION FROM NAVBAR
  // --------------------------------------------------

  async function handleAddTransaction(
    newTransaction
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user.id,
          account_id:
            newTransaction.account_id ||
            null,
          account:
            newTransaction.account ||
            null,
          type:
            newTransaction.type,
          amount:
            Number(
              newTransaction.amount
            ) || 0,
          category:
            newTransaction.category ||
            null,
          description:
            newTransaction.description ||
            newTransaction.title ||
            null,
          date:
            newTransaction.date ||
            new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        "Settings transaction error:",
        error
      );

      alert(
        "Unable to save transaction."
      );

      return;
    }

    console.log(
      "Transaction saved:",
      data
    );

    setShowTransactionModal(false);
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-area">

        <Navbar
          onAddTransaction={() =>
            setShowTransactionModal(true)
          }
        />

        <main className="settings-page">

          <div className="settings-header">
            <h1>⚙️ Settings</h1>

            <p>
              Manage your PocketWise preferences
            </p>
          </div>

          <div className="settings-container">

            {/* PROFILE */}

            <div className="settings-card profile-card">

              <h2>👤 Profile</h2>

              {!editing ? (
                <>
                  <div className="profile-box">

                    <div className="profile-avatar">
                      {profile.name
                        ? profile.name
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </div>

                    <div className="profile-info">

                      <h3>
                        {profile.name}
                      </h3>

                      <p>
                        Google Account
                      </p>

                      <p>
                        {profile.email}
                      </p>

                    </div>

                  </div>

                  <button
                    className="settings-btn"
                    onClick={() =>
                      setEditing(true)
                    }
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <>
                  <div className="profile-inputs">

                    <label>
                      Name
                    </label>

                    <input
                      className="settings-input"
                      value={
                        profile.name
                      }
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          name:
                            e.target.value,
                        })
                      }
                    />

                    <label>
                      Email
                    </label>

                    <input
                      className="settings-input"
                      value={
                        profile.email
                      }
                      readOnly
                    />

                  </div>

                  <button
                    className="settings-btn"
                    onClick={saveProfile}
                  >
                    Save Changes
                  </button>
                </>
              )}

            </div>

            {/* CURRENCY */}

            <div className="settings-card">

              <h2>💱 Currency</h2>

              <div className="setting-item">

                <div className="setting-left">

                  <div className="setting-icon">
                    ₹
                  </div>

                  <div>

                    <strong>
                      Default Currency
                    </strong>

                    <p>
                      Used for all transactions
                    </p>

                  </div>

                </div>

                <select
                  className="settings-select"
                  value={currency}
                  onChange={(e) =>
                    changeCurrency(
                      e.target.value
                    )
                  }
                >

                  <option value="INR">
                    🇮🇳 ₹ Indian Rupee
                  </option>

                  <option value="USD">
                    🇺🇸 $ US Dollar
                  </option>

                  <option value="EUR">
                    🇪🇺 € Euro
                  </option>

                  <option value="GBP">
                    🇬🇧 £ Pound
                  </option>

                </select>

              </div>

            </div>

            {/* NOTIFICATIONS */}

            <div className="settings-card">

              <h2>🔔 Notifications</h2>

              <div className="setting-item">

                <div className="setting-left">

                  <div className="setting-icon">
                    🔔
                  </div>

                  <div>

                    <strong>
                      Budget Alerts
                    </strong>

                    <p>
                      Expense reminders and alerts
                    </p>

                  </div>

                </div>

                <label className="toggle">

                  <input
                    type="checkbox"
                    checked={
                      notifications
                    }
                    onChange={(e) =>
                      changeNotifications(
                        e.target.checked
                      )
                    }
                  />

                  <span></span>

                </label>

              </div>

            </div>

            {/* CSV IMPORT / EXPORT */}

            <div className="settings-card">

              <h2>
                📊 Transaction Data
              </h2>

              <div className="setting-item">

                <div className="setting-left">

                  <div className="setting-icon">
                    📄
                  </div>

                  <div>

                    <strong>
                      Transaction Backup
                    </strong>

                    <p>
                      Import or export your
                      transactions using CSV
                    </p>

                  </div>

                </div>

              </div>

              <div className="csv-buttons">

                <button
                  className="settings-btn export-btn"
                  onClick={exportCSV}
                >
                  📤 Export CSV
                </button>

                <label className="settings-btn import-btn">

                  📥 Import CSV

                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={importCSV}
                    style={{
                      display: "none",
                    }}
                  />

                </label>

              </div>

            </div>

            {/* ABOUT */}

            <div className="settings-card">

              <h2>
                ℹ️ About PocketWise
              </h2>

              <div className="about-item">
                <span>
                  Version
                </span>

                <span>
                  1.0
                </span>
              </div>

              <div className="about-item">
                <span>
                  Built With
                </span>

                <span>
                  React + Vite
                </span>
              </div>

              <div className="about-item">
                <span>
                  Purpose
                </span>

                <span>
                  Student Finance
                </span>
              </div>

            </div>

            {/* ACCOUNT */}

            <div className="settings-card">

              <h2>
                🔐 Account
              </h2>

              <p>
                Your PocketWise account is
                connected to Google.
              </p>

              <button
                className="settings-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>

            </div>

            {/* RESET */}

            <div className="settings-card">

              <h2>
                🗑 Danger Zone
              </h2>

              <p>
                Delete all PocketWise financial
                data permanently
              </p>

              <button
                className="settings-btn reset-btn"
                onClick={resetData}
              >
                Reset All Data
              </button>

            </div>

          </div>

        </main>

      </div>

      {/* TRANSACTION MODAL */}

      {showTransactionModal && (
        <div className="modal-overlay">

          <TransactionForm
            accounts={accounts}
            onAdd={handleAddTransaction}
            onClose={() =>
              setShowTransactionModal(
                false
              )
            }
          />

        </div>
      )}

    </div>
  );
}

export default Settings;