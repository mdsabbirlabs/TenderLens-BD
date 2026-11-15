
import { NavLink } from "react-router-dom";

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const handleNavigation = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="sidebar-brand">
        <div className="brand-icon">
          <img src="/tenderlens-logo.png" alt="TenderLens Logo" />
        </div>

        <div className="brand-text">
          <h2>TenderLens</h2>
          <span>BD EDITION</span>
        </div>
      </div>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "›" : "‹"}
      </button>

      <div className="sidebar-menu">
        <p className="menu-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <NavLink to="/" end className="nav-item" onClick={handleNavigation}>
            <span className="nav-icon">▦</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/tender-details" className="nav-item" onClick={handleNavigation}>
            <span className="nav-icon">⇧</span>
            <span className="nav-text">Tender Details</span>
          </NavLink>

          <NavLink to="/analysis-results" className="nav-item" onClick={handleNavigation}>
            <span className="nav-icon">◈</span>
            <span className="nav-text">Analysis Results</span>
          </NavLink>

          <NavLink to="/history" className="nav-item" onClick={handleNavigation}>
            <span className="nav-icon">☷</span>
            <span className="nav-text">Analysis History</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="profile">
          <div className="avatar">SA</div>

          <div className="profile-info">
            <strong>My Workspace</strong>
            <small>Free Account</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
