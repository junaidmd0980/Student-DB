import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import {
  logoutUser,
  logoutAllUsers,
} from "../services/auth.service.js";

import DeleteConfirmModal from "../../shared/components/DeleteConfirmModel.jsx";

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, isInitialized, setUser } = useAuth();

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoutAction, setLogoutAction] = useState(null);

  const openLogoutModal = (type) => {
    setLogoutAction({
      type,
      name: type === "all" ? "all devices" : "this device",
    });
  };

  const closeLogoutModal = () => {
    if (actionLoading) return;

    setLogoutAction(null);
  };

  const clearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    if (setUser) {
      setUser(null);
    }

    navigate("/login", { replace: true });
  };

  const handleConfirmLogout = async () => {
    if (!logoutAction) return;

    try {
      setActionLoading(true);
      setError("");

      if (logoutAction.type === "all") {
        await logoutAllUsers();
      } else {
        await logoutUser();
      }

      clearSession();
      setLogoutAction(null);
    } catch (err) {
      console.error("Logout failed:", err);
      
      clearSession();
    } finally {
      setActionLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <main className="account-page">
        <section className="account-container">
          <div className="account-loading">
            <span className="spinner" />
            <p>Loading account...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="account-page">
        <section className="account-container">
          <header className="account-header">
            <div className="profile-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h1>Account</h1>
              <p>Manage your account and active sessions.</p>
            </div>
          </header>

          {error && (
            <div className="account-error" role="alert">
              {error}
            </div>
          )}

          <section className="account-card">
            <div className="card-title">
              <h2>Profile information</h2>
              <span className="status-badge">Active</span>
            </div>

            <div className="profile-details">
              <div className="profile-row">
                <span className="profile-label">User name</span>
                <span className="profile-value">
                  {user?.username || "Not available"}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">
                  {user?.email || "Not available"}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Role</span>
                <span className="profile-value role-value">
                  {user?.role || "Not available"}
                </span>
              </div>
            </div>
          </section>

          <section className="account-card">
            <div className="card-title">
              <div>
                <h2>Security</h2>
                <p>Control where your account is signed in.</p>
              </div>
            </div>

            <div className="security-action">
              <div>
                <h3>Log out from this device</h3>
                <p>End your current session on this device.</p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => openLogoutModal("current")}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Logout"}
              </button>
            </div>

            <div className="security-action">
              <div>
                <h3>Log out from all devices</h3>
                <p>End all active sessions associated with your account.</p>
              </div>

              <button
                type="button"
                className="danger-button"
                onClick={() => openLogoutModal("all")}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Logout all"}
              </button>
            </div>
          </section>
        </section>
      </main>

      <DeleteConfirmModal
        open={Boolean(logoutAction)}
        entity="logout"
        item={logoutAction}
        loading={actionLoading}
        onClose={closeLogoutModal}
        onConfirm={handleConfirmLogout}
        title={
          logoutAction?.type === "all"
            ? "Log out from all devices"
            : "Log out"
        }
        description={
          logoutAction?.type === "all"
            ? "You are about to log out from all devices."
            : "You are about to log out from this device."
        }
        warning={
          logoutAction?.type === "all"
            ? "All active sessions associated with your account will be ended."
            : "Your current session on this device will be ended."
        }
        confirmLabel={
          logoutAction?.type === "all" ? "Logout all" : "Logout"
        }
        cancelLabel="Cancel"
        requireTypedConfirm={false}
      />
    </>
  );
}