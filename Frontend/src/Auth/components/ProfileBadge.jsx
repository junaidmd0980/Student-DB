import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import "../../styles/components/_profile-badge.scss";

function getInitials(user) {
  const name = user?.username || user?.email || "";

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  return initials.toUpperCase() || "U";
}

function ProfileBadge() {
  const { user, isInitialized } = useAuth();

  const initials = useMemo(() => getInitials(user), [user]);

  if (!isInitialized) {
    return null;
  }

  if (!user) {
    return (
      <span className="profile-badge profile-badge--empty">
        <span className="profile-badge__empty-icon" aria-hidden="true">
          ?
        </span>

        <span>Not logged in</span>
      </span>
    );
  }

  return (
    <div
      className="profile-badge profile-badge--compact"
      title={user.username || user.email}
      aria-label={`Signed in as ${user.username || user.email}`}
    >
      <span className="profile-badge__avatar" aria-hidden="true">
        {initials}
        <span className="profile-badge__status" />
      </span>

      <span className="profile-badge__details">
        <span className="profile-badge__name">
          {user.username || "User"}
        </span>

        {user.role && (
          <span className="profile-badge__role">
            {user.role}
          </span>
        )}
      </span>
    </div>
  );
}

export default ProfileBadge;