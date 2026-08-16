import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

import ProfileBadge from "../../Auth/components/ProfileBadge.jsx";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__left">
        <div className="navbar__brand">
          <span className="navbar__brand-icon">
            <GraduationCap size={22} />
          </span>

          <div className="navbar__brand-text">
            <h1>Student DB</h1>
            <span>Student Management System</span>
          </div>
        </div>
      </div>

      <div className="navbar__right">
        <Link
          to="/account"
          className="navbar__profile-link"
          aria-label="Open account page"
        >
          <ProfileBadge />
        </Link>
      </div>
    </header>
  );
}

export default Navbar;