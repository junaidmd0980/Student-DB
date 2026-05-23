import { GraduationCap } from "lucide-react";

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
    </header>
  );
}

export default Navbar;