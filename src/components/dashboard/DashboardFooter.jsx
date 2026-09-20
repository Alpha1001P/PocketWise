function DashboardFooter() {
  return (
    <footer className="dashboard-footer">
      <div className="footer-left">
        <div className="footer-brand">
          <span className="footer-logo">💎</span>
          <strong>PocketWise</strong>
          <span className="footer-badge">Student Edition</span>
        </div>
        <p className="footer-privacy-note">
          🔒 100% Client-Side Privacy — Your financial data is securely stored on your device.
        </p>
      </div>

      <div className="footer-right">
        <div className="footer-status">
          <span className="status-indicator"></span>
          <span>All Systems Operational</span>
        </div>
        <p className="footer-copyright">
          © {new Date().getFullYear()} PocketWise. Smart Money Management for Students.
        </p>
      </div>
    </footer>
  );
}

export default DashboardFooter;