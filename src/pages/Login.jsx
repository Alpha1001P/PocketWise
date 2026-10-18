import { useEffect, useState } from "react";
import "../styles/login.css";
import { supabase } from "../lib/supabase";

function Login() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        window.location.href = "/";
      }
    };

    checkSession();
  }, []);

  async function handleGoogleLogin() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google login error:", error);
      alert("Google login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Decorative background */}
      <div className="login-bg-shape shape-one"></div>
      <div className="login-bg-shape shape-two"></div>

      <div className="login-container">

        {/* ================= LEFT SIDE ================= */}
        <section className="login-showcase">

          <div className="showcase-content">
            <div className="showcase-badge">
              💰 Smart Money Management
            </div>

            <h1>
              Better Money,
              <br />
              <span>Brighter Future.</span>
            </h1>

            <p className="showcase-description">
              Track your expenses, set your goals,
              <br />
              and build a smarter tomorrow.
            </p>

            {/* Finance illustration */}
            <div className="finance-illustration">

              {/* Phone */}
              <div className="phone-card">
                <div className="phone-top">
                  <span>9:41</span>
                  <span>● ● ●</span>
                </div>

                <div className="phone-balance-label">
                  Total Balance
                </div>

                <div className="phone-balance">
                  ₹12,480
                </div>

                <div className="phone-growth">
                  ↗ +12% this month
                </div>

                <div className="mini-chart">
                  <span className="bar bar-one"></span>
                  <span className="bar bar-two"></span>
                  <span className="bar bar-three"></span>
                  <span className="bar bar-four"></span>
                  <span className="bar bar-five"></span>
                </div>

                <div className="recent-title">
                  Recent Transactions
                </div>

                <div className="mini-transaction">
                  <div className="transaction-icon food-icon">
                    🍔
                  </div>

                  <div>
                    <strong>Food</strong>
                    <small>Today</small>
                  </div>

                  <b className="expense">
                    -₹320
                  </b>
                </div>

                <div className="mini-transaction">
                  <div className="transaction-icon travel-icon">
                    🚌
                  </div>

                  <div>
                    <strong>Transport</strong>
                    <small>Yesterday</small>
                  </div>

                  <b className="expense">
                    -₹120
                  </b>
                </div>

                <div className="mini-transaction">
                  <div className="transaction-icon salary-icon">
                    💰
                  </div>

                  <div>
                    <strong>Salary</strong>
                    <small>3 days ago</small>
                  </div>

                  <b className="income">
                    +₹3,000
                  </b>
                </div>
              </div>

              {/* Wallet */}
              <div className="wallet">
                <div className="wallet-money">
                  ₹
                </div>

                <div className="wallet-lock">
                  ●
                </div>
              </div>

              {/* Coins */}
              <div className="coins">
                <div className="coin coin-one">₹</div>
                <div className="coin coin-two">₹</div>
                <div className="coin coin-three">₹</div>
              </div>

              {/* Floating leaves */}
              <div className="leaf leaf-one"></div>
              <div className="leaf leaf-two"></div>
              <div className="leaf leaf-three"></div>
            </div>

            {/* Features */}
            <div className="showcase-features">

              <div className="feature">
                <div className="feature-icon">📈</div>
                <strong>Track</strong>
                <span>Expenses</span>
              </div>

              <div className="feature-divider"></div>

              <div className="feature">
                <div className="feature-icon">🎯</div>
                <strong>Set</strong>
                <span>Goals</span>
              </div>

              <div className="feature-divider"></div>

              <div className="feature">
                <div className="feature-icon">🛡️</div>
                <strong>Build</strong>
                <span>Better Habits</span>
              </div>

            </div>
          </div>
        </section>

        {/* ================= RIGHT SIDE ================= */}
        <section className="login-section">

          <div className="login-card">

            {/* Logo */}
            <div className="login-brand">

              <div className="brand-icon">
                💰
              </div>

              <h2>
                Pocket<span>Wise</span>
              </h2>

              <p>
                Smart Finance for Students
              </p>

            </div>

            {/* Welcome */}
            <div className="welcome-section">

              <h1>
                Welcome Back!
              </h1>

              <p>
                Sign in to continue your financial
                <br />
                journey with PocketWise.
              </p>

            </div>

            {/* Google Button */}
            <button
              type="button"
              className="google-login-button"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <span className="google-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.92v2.42h3.14c1.84-1.69 2.93-4.18 2.93-7.37z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.42c-.87.58-1.98.93-3.31.93-2.55 0-4.71-1.72-5.49-4.04H3.26v2.5A9.74 9.74 0 0 0 12 21.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.51 13.81A5.86 5.86 0 0 1 6.2 12c0-.63.11-1.25.31-1.81V7.69H3.26A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.01 4.31l3.25-2.5z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 6.15c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.23 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.74 5.39l3.25 2.5C7.29 7.87 9.45 6.15 12 6.15z"
                  />
                </svg>
              </span>

              <span className="google-button-text">
                {loading
                  ? "Connecting..."
                  : "Continue with Google"}
              </span>

              <span className="google-arrow">
                →
              </span>
            </button>

            {/* Security */}
            <div className="secure-login">
              <span className="lock-icon">🔒</span>

              <span>
                Secure authentication powered by Google
              </span>
            </div>

            {/* Bottom */}
            <div className="login-bottom">
              <span>🔐</span>
              Your financial data stays private and secure.
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

export default Login;