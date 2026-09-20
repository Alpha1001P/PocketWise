import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar() {
  const [profileName, setProfileName] = useState(
    localStorage.getItem("profileName") || "PocketWise User"
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleStorageChange() {
      setProfileName(
        localStorage.getItem("profileName") || "PocketWise User"
      );
    }

    window.addEventListener("storage", handleStorageChange);

    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: "🏠",
      path: "/",
    },
    {
      name: "Transactions",
      icon: "💳",
      path: "/transactions",
    },
    {
      name: "Reports & Analytics",
      icon: "📊",
      path: "/reports",
    },
    {
      name: "Calendar",
      icon: "📅",
      path: "/calendar",
    },
    {
      name: "Settings",
      icon: "⚙️",
      path: "/settings",
    },
  ];

  const initialLetter = (profileName || "P")
    .charAt(0)
    .toUpperCase();

  function closeMobileSidebar() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
        ></div>
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        <div className="sidebar-top">

          {/* Brand */}
          <div className="sidebar-brand">
            <div className="brand-icon-box">
              💰
            </div>

            <div className="brand-text">
              <h2>PocketWise</h2>
              <span>Student Edition</span>
            </div>

            {/* Mobile close button */}
            <button
              className="sidebar-close-button"
              onClick={closeMobileSidebar}
              aria-label="Close navigation menu"
            >
              ×
            </button>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  isActive
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
              >
                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span className="sidebar-text">
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="sidebar-profile-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {initialLetter}
            </div>

            <span
              className="profile-status-dot"
              title="Active"
            ></span>
          </div>

          <div className="profile-details">
            <h4>{profileName}</h4>
            <p>Personal Finance</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;