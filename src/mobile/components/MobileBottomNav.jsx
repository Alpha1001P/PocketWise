import { NavLink } from "react-router-dom";
import "./MobileBottomNav.css";

function MobileBottomNav({ onAddTransaction }) {
  const leftItems = [
    { path: "/",             label: "Home",    icon: "🏠" },
    { path: "/transactions", label: "Txns",    icon: "↕" },
  ];

  const rightItems = [
    { path: "/reports",      label: "Reports", icon: "📊" },
    { path: "/settings",     label: "Settings",icon: "⚙" },
  ];

  return (
    <nav className="m-bottom-nav">
      {leftItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className={({ isActive }) =>
            `m-nav-item${isActive ? " active" : ""}`
          }
        >
          <span className="m-nav-icon">{item.icon}</span>
          <span className="m-nav-label">{item.label}</span>
        </NavLink>
      ))}

      <button
        type="button"
        className="m-nav-add"
        onClick={onAddTransaction}
        aria-label="Add transaction"
      >
        <span>+</span>
        <small>Add</small>
      </button>

      {rightItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `m-nav-item${isActive ? " active" : ""}`
          }
        >
          <span className="m-nav-icon">{item.icon}</span>
          <span className="m-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileBottomNav;