import { useState, useEffect, useRef } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileTransactionForm from "../components/MobileTransactionForm";
import { getAccounts } from "../../lib/database";
import { supabase } from "../../lib/supabase";
import "../styles/mobile.css";

function MobileSettings() {
  const [currency, setCurrency] = useState("INR");
  const [notifications, setNotifications] = useState(true);

  const [profile, setProfile] = useState({
    name: "Loading...",
    email: "",
    avatar_url: "",
  });

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
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

    const userProfile = {
      name: googleName,
      email: user.email || "",
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
    };

    setProfile(userProfile);
    setEditName(userProfile.name);

    // Load user settings from Supabase
    const { data: settingsData } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settingsData) {
      setCurrency(settingsData.currency || "INR");
      setNotifications(settingsData.notifications_enabled !== false);
    }

    // Load accounts
    const { data: accountsData } = await getAccounts();
    if (accountsData) setAccounts(accountsData);
  }

  async function saveSettings(changes = {}) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        currency: changes.currency !== undefined ? changes.currency : currency,
        notifications_enabled:
          changes.notifications_enabled !== undefined
            ? changes.notifications_enabled
            : notifications,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  async function handleCurrencyChange(val) {
    setCurrency(val);
    await saveSettings({ currency: val });
  }

  async function handleNotificationToggle(val) {
    setNotifications(val);
    await saveSettings({ notifications_enabled: val });
  }

  async function handleSaveProfile() {
    if (!editName.trim()) return;

    const { error } = await supabase.auth.updateUser({
      data: { full_name: editName.trim(), name: editName.trim() },
    });

    if (error) {
      alert(error.message || "Failed to update profile name.");
      return;
    }

    setProfile((prev) => ({ ...prev, name: editName.trim() }));
    setEditing(false);
  }

  async function handleLogout() {
    if (!window.confirm("Are you sure you want to log out of PocketWise?")) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout failed. Please try again.");
      return;
    }
    window.location.href = "/login";
  }

  // ─────────────────────────────────────────────
  // CSV EXPORT (SUPABASE)
  // ─────────────────────────────────────────────
  async function handleExportCSV() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      alert("Unable to export transactions: " + error.message);
      return;
    }

    if (!transactions || transactions.length === 0) {
      alert("No transactions available to export.");
      return;
    }

    const headers = ["id", "title", "amount", "type", "category", "account", "date"];
    const rows = transactions.map((t) => [
      t.id,
      t.description || t.title || "",
      t.amount,
      t.type,
      t.category || "",
      t.account || "",
      t.date || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((v) => {
            const s = String(v ?? "");
            return s.includes(",") || s.includes('"') || s.includes("\n")
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PocketWise_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────
  // CSV IMPORT (SUPABASE)
  // ─────────────────────────────────────────────
  async function handleImportCSV(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    setImporting(true);

    try {
      const text = await file.text();
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        alert("The selected CSV file appears to be empty.");
        setImporting(false);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const titleIndex = headers.findIndex((h) => h === "title" || h === "description");
      const amountIndex = headers.indexOf("amount");
      const typeIndex = headers.indexOf("type");
      const categoryIndex = headers.indexOf("category");
      const accountIndex = headers.indexOf("account");
      const dateIndex = headers.indexOf("date");

      if (amountIndex === -1) {
        alert("CSV must contain an 'amount' column.");
        setImporting(false);
        return;
      }

      const newTransactions = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        const amount = Number(row[amountIndex]);
        if (isNaN(amount) || amount <= 0) continue;

        newTransactions.push({
          user_id: user.id,
          description: titleIndex !== -1 ? row[titleIndex] || "Imported Transaction" : "Imported Transaction",
          amount: amount,
          type: typeIndex !== -1 ? (row[typeIndex] || "Expense") : "Expense",
          category: categoryIndex !== -1 ? row[categoryIndex] || null : null,
          account: accountIndex !== -1 ? row[accountIndex] || null : null,
          date: dateIndex !== -1 && row[dateIndex] ? new Date(row[dateIndex]).toISOString() : new Date().toISOString(),
        });
      }

      if (newTransactions.length === 0) {
        alert("No valid transaction rows found to import.");
        setImporting(false);
        return;
      }

      const { error: insertError } = await supabase.from("transactions").insert(newTransactions);

      if (insertError) {
        alert("Import failed: " + insertError.message);
      } else {
        alert(`Successfully imported ${newTransactions.length} transactions.`);
      }
    } catch (err) {
      console.error("Import error:", err);
      alert("Error parsing CSV file.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ─────────────────────────────────────────────
  // RESET ALL DATA
  // ─────────────────────────────────────────────
  async function handleResetData() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete ALL PocketWise transactions and accounts? This cannot be undone."
    );
    if (!confirmDelete) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("transactions").delete().eq("user_id", user.id);
    await supabase.from("accounts").delete().eq("user_id", user.id);

    alert("All financial data deleted successfully.");
    window.location.reload();
  }

  const initialLetter = (profile.name?.charAt(0) || "P").toUpperCase();

  return (
    <div className="mobile-app">
      <div className="mobile-page">
        <MobileHeader
          title="Settings"
          subtitle="Account & Cloud Sync"
          initial={initialLetter}
        />

        <main className="m-content">
          {/* User Profile Card (Google / Supabase Auth) */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Google Account</h2>
              <button
                type="button"
                className="m-card-action"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit Name"}
              </button>
            </div>

            {!editing ? (
              <div className="m-profile-box">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="m-profile-avatar"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="m-profile-avatar">{initialLetter}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="m-profile-name" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {profile.name}
                  </div>
                  <div className="m-profile-email" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {profile.email}
                  </div>
                  <div className="m-profile-badge">
                    <span>🟢</span> Connected via Google
                  </div>
                </div>
              </div>
            ) : (
              <div className="m-profile-form">
                <div className="m-form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="m-btn m-btn-primary m-btn-full"
                  onClick={handleSaveProfile}
                >
                  Save Display Name
                </button>
              </div>
            )}
          </section>

          {/* Preferences */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Preferences</h2>
            </div>

            <div className="m-setting-group">
              <div className="m-setting-row">
                <div className="m-setting-info">
                  <strong>Standard Currency</strong>
                  <span>Format for totals across app</span>
                </div>
                <div className="m-setting-control">
                  <select
                    className="m-select"
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                  >
                    <option value="INR">🇮🇳 INR (₹)</option>
                    <option value="USD">🇺🇸 USD ($)</option>
                    <option value="EUR">🇪🇺 EUR (€)</option>
                    <option value="GBP">🇬🇧 GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="m-setting-row">
                <div className="m-setting-info">
                  <strong>Budget Alerts</strong>
                  <span>Notify on 90% threshold consumption</span>
                </div>
                <div className="m-setting-control">
                  <label className="m-toggle">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => handleNotificationToggle(e.target.checked)}
                    />
                    <span className="m-toggle-track" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Data Backup, Import & Export */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Data Backup & Sync</h2>
            </div>

            <div className="m-setting-group">
              {/* Export CSV */}
              <div className="m-setting-row">
                <div className="m-setting-info">
                  <strong>Export Transactions</strong>
                  <span>Download CSV backup of your Supabase ledger</span>
                </div>
                <div className="m-setting-control">
                  <button
                    type="button"
                    className="m-btn m-btn-ghost m-btn-sm"
                    onClick={handleExportCSV}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Import CSV */}
              <div className="m-setting-row">
                <div className="m-setting-info">
                  <strong>Import Transactions</strong>
                  <span>Upload a CSV file to add records to Supabase</span>
                </div>
                <div className="m-setting-control">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImportCSV}
                  />
                  <button
                    type="button"
                    className="m-btn m-btn-ghost m-btn-sm"
                    disabled={importing}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {importing ? "Importing..." : "Upload CSV"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Logout & Session Management */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Account Session</h2>
            </div>
            <p style={{ fontSize: "13px", color: "var(--m-text-3)", margin: "0 0 12px" }}>
              Logged in with Google as <strong>{profile.email}</strong>.
            </p>
            <button
              type="button"
              className="m-btn m-btn-ghost m-btn-full"
              style={{ color: "var(--m-primary)", borderColor: "var(--m-primary)" }}
              onClick={handleLogout}
            >
              Sign Out of PocketWise
            </button>
          </section>

          {/* Danger Zone */}
          <section className="m-card" style={{ borderColor: "var(--m-expense-border)" }}>
            <div className="m-card-header">
              <h2 className="m-card-title" style={{ color: "var(--m-expense)" }}>
                Danger Zone
              </h2>
            </div>
            <p style={{ fontSize: "13px", color: "var(--m-text-2)", margin: "0 0 14px", lineHeight: "1.4" }}>
              Permanently delete all transactions and bank accounts from the database.
            </p>
            <button
              type="button"
              className="m-btn m-btn-danger m-btn-full"
              onClick={handleResetData}
            >
              Reset All Financial Records
            </button>
          </section>
        </main>
      </div>

      {showAddForm && (
        <MobileTransactionForm
          accounts={accounts}
          onSuccess={() => setShowAddForm(false)}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <MobileBottomNav onAddTransaction={() => setShowAddForm(true)} />
    </div>
  );
}

export default MobileSettings;
