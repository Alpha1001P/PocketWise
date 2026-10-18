import { useState, useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileTransactionForm from "../components/MobileTransactionForm";
import { getAccounts } from "../../lib/database";
import "../styles/mobile.css";

function MobileSettings() {
  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "INR"
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  const [profile, setProfile] = useState({
    name: localStorage.getItem("profileName") || "Student User",
    email: localStorage.getItem("profileEmail") || "student@pocketwise.com",
  });

  const [editing, setEditing] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    const { data } = await getAccounts();
    if (data) setAccounts(data);
  }

  function handleSaveProfile() {
    localStorage.setItem("profileName", profile.name);
    localStorage.setItem("profileEmail", profile.email);
    setEditing(false);
  }

  function handleCurrencyChange(val) {
    setCurrency(val);
    localStorage.setItem("currency", val);
  }

  function handleNotificationToggle(val) {
    setNotifications(val);
    localStorage.setItem("notifications", val);
  }

  function handleExportCSV() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    if (transactions.length === 0) {
      alert("No local transaction records found to export.");
      return;
    }

    const headers = Object.keys(transactions[0]);
    const csv = [
      headers.join(","),
      ...transactions.map((row) =>
        headers.map((field) => JSON.stringify(row[field] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "PocketWise_Mobile_Export.csv";
    link.click();
  }

  function handleResetData() {
    if (window.confirm("Are you sure you want to reset all PocketWise local configuration?")) {
      localStorage.clear();
      alert("Local data cleared.");
      window.location.reload();
    }
  }

  return (
    <div className="mobile-app">
      <div className="mobile-page">
        <MobileHeader
          title="Settings"
          subtitle="Preferences & Account Info"
          initial="S"
        />

        <main className="m-content">
          {/* Profile Card */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">User Profile</h2>
              <button
                type="button"
                className="m-card-action"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            {!editing ? (
              <div className="m-profile-box">
                <div className="m-profile-avatar">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="m-profile-name">{profile.name}</div>
                  <div className="m-profile-email">{profile.email}</div>
                  <div className="m-profile-badge">Active Student Plan</div>
                </div>
              </div>
            ) : (
              <div className="m-profile-form">
                <div className="m-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>

                <div className="m-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>

                <button
                  type="button"
                  className="m-btn m-btn-primary m-btn-full"
                  onClick={handleSaveProfile}
                >
                  Save Changes
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
                  <span>Display format for totals</span>
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
                  <strong>Threshold Alerts</strong>
                  <span>Prompt when approaching 90% budget</span>
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

          {/* Data Backup & Export */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Data Management</h2>
            </div>

            <div className="m-setting-group">
              <div className="m-setting-row">
                <div className="m-setting-info">
                  <strong>Export Records</strong>
                  <span>Save CSV file of current offline transactions</span>
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
            </div>
          </section>

          {/* Danger Zone */}
          <section className="m-card" style={{ borderColor: "var(--m-expense-border)" }}>
            <div className="m-card-header">
              <h2 className="m-card-title" style={{ color: "var(--m-expense)" }}>
                Reset & Clear
              </h2>
            </div>

            <p style={{ fontSize: "13px", color: "var(--m-text-2)", margin: "0 0 14px", lineHeight: "1.4" }}>
              Clear local cached preferences, budget targets, and offline records.
            </p>

            <button
              type="button"
              className="m-btn m-btn-danger m-btn-full"
              onClick={handleResetData}
            >
              Reset Application Cache
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
