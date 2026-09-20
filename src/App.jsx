import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { supabase } from "./lib/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import TransactionManagement from "./pages/TransactionManagement";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing Supabase session
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session check error:", error);
        setSession(null);
      } else {
        setSession(data.session);
      }

      setLoading(false);
    }

    checkSession();

    // Listen for login/logout/auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-icon">💰</div>

        <h1>PocketWise</h1>

        <p>Loading your finances...</p>

        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Dashboard */}
      <Route
        path="/"
        element={
          session ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          session ? <Navigate to="/" replace /> : <Login />
        }
      />

      {/* Transactions */}
      <Route
        path="/transactions"
        element={
          session ? (
            <TransactionManagement />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          session ? <Reports /> : <Navigate to="/login" replace />
        }
      />

      {/* Calendar */}
      <Route
        path="/calendar"
        element={
          session ? <Calendar /> : <Navigate to="/login" replace />
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          session ? <Settings /> : <Navigate to="/login" replace />
        }
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={
          <Navigate to={session ? "/" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;