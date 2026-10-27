import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import TransactionManagement from "./pages/TransactionManagement";

import MobileDashboard from "./mobile/pages/MobileDashboard";
import MobileTransactions from "./mobile/pages/MobileTransactions";
import MobileReports from "./mobile/pages/MobileReports";
import MobileSettings from "./mobile/pages/MobileSettings";
import MobileBudget from "./mobile/pages/MobileBudget";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          session ? (
            <ResponsivePage
              DesktopComponent={Dashboard}
              MobileComponent={MobileDashboard}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Transactions */}
      <Route
        path="/transactions"
        element={
          session ? (
            <ResponsivePage
              DesktopComponent={TransactionManagement}
              MobileComponent={MobileTransactions}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          session ? (
            <ResponsivePage
              DesktopComponent={Reports}
              MobileComponent={MobileReports}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Calendar */}
      <Route
        path="/calendar"
        element={
          session ? (
            <ResponsivePage
              DesktopComponent={Calendar}
              MobileComponent={MobileReports}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Budget (mobile only — desktop uses Settings) */}
      <Route
        path="/budget"
        element={
          session ? (
            <ResponsivePage
              DesktopComponent={Settings}
              MobileComponent={MobileBudget}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          session ? (
            <ResponsivePage
              DesktopComponent={Settings}
              MobileComponent={MobileSettings}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to={session ? "/" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

function ResponsivePage({ DesktopComponent, MobileComponent }) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile ? <MobileComponent /> : <DesktopComponent />;
}

export default App;