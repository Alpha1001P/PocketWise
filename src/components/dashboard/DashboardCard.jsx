function DashboardCard({
  icon,
  title,
  amount,
  subtitle = "Across all accounts"
}) {
  return (

    <div className="dashboard-card">

      <div className="dashboard-card-top">

        <div className="dashboard-icon-wrapper">

          <span className="card-icon">
            {icon}
          </span>

        </div>

        <div className="dashboard-card-text">

          <h3 className="dashboard-card-title">
            {title}
          </h3>

          <p className="dashboard-card-subtitle">
            {subtitle}
          </p>

        </div>

      </div>

      <div className="dashboard-card-bottom">

        <h2 className="dashboard-card-amount">
          {amount}
        </h2>

        <span className="dashboard-card-status">
          ● Updated just now
        </span>

      </div>

    </div>

  );
}

export default DashboardCard;