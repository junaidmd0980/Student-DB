import { NavLink } from "react-router-dom";
import { Menu, Database, UserPlus, Users, UserCog, FlaskConical } from "lucide-react";

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--collapsed"}`}>
      <div className="sidebar__top">
        <button
          type="button"
          className="sidebar__toggle"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="sidebar__icon">
            <Menu size={18} />
          </span>
          <span className={`sidebar__text ${isOpen ? "sidebar__text--show" : ""}`}>
            Menu
          </span>
        </button>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <span className="sidebar__icon">
            <Database size={18} />
          </span>
          <span className={`sidebar__text ${isOpen ? "sidebar__text--show" : ""}`}>
            Dashboard
          </span>
        </NavLink>

        <NavLink
          to="/students/create"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <span className="sidebar__icon">
            <UserPlus size={18} />
          </span>
          <span className={`sidebar__text ${isOpen ? "sidebar__text--show" : ""}`}>
            Create Student
          </span>
        </NavLink>

        <NavLink
          to="/students/list"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <span className="sidebar__icon">
            <Users size={18} />
          </span>
          <span className={`sidebar__text ${isOpen ? "sidebar__text--show" : ""}`}>
            Students
          </span>
        </NavLink>

        <NavLink
          to="/lab-sessions"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <span className="sidebar__icon">
            <FlaskConical size={18} />
          </span>
          <span className={`sidebar__text ${isOpen ? "sidebar__text--show" : ""}`}>
            Lab Sessions
          </span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;