import "./MobileHeader.css";

function MobileHeader({ title = "PocketWise", subtitle, initial = "P" }) {
  return (
    <header className="m-header">
      <div className="m-header-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="m-header-avatar">{initial}</div>
    </header>
  );
}

export default MobileHeader;