import React, { useState } from "react";
import { useTenant } from "../../tenants/context/TenantContext.jsx";
import { useError } from "../../../shared/context/ErrorContext.jsx";
import {
  getMyTenants,
  removeTenantUser,
  changeTenantUserRole,
} from "../../tenants/services/tenantService.js";
import CustomSelect from "../../../shared/components/CustomSelect.jsx";
import DeleteConfirmModal from "../../../shared/components/DeleteConfirmModel.jsx";

const ROLES = ["admin", "faculty", "viewer"];

export default function ManageRolesGrid({ className = "" }) {
  const { currentTenant, setTenants, selectTenant } = useTenant();
  const { showError } = useError();

  const users = currentTenant?.users || [];

  const [workingId, setWorkingId] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const refresh = async () => {
    try {
      const data = await getMyTenants();
      const list = Array.isArray(data) ? data : data.data || [];

      setTenants(list);

      const updated = list.find(
        (tenant) =>
          (tenant._id || tenant.id) ===
          (currentTenant?._id || currentTenant?.id)
      );

      if (updated) {
        selectTenant(updated);
      }
    } catch (err) {
      showError(err?.message || "Failed to refresh Organizations");
    }
  };

  const handleChangeRole = async (userId, role) => {
    if (!currentTenant || !userId) return;

    setWorkingId(`${userId}-role`);

    try {
      await changeTenantUserRole(
        currentTenant._id || currentTenant.id,
        userId,
        role
      );

      await refresh();
    } catch (err) {
      showError(err?.message || "Failed to change role");
    } finally {
      setWorkingId(null);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteUser(user);
  };

  const closeDeleteModal = () => {
    if (workingId) return;
    setDeleteUser(null);
  };

  const handleConfirmRemove = async () => {
    if (!currentTenant || !deleteUser) return;

    const tenantId = currentTenant._id || currentTenant.id;
    const userId = deleteUser._id || deleteUser.id;

    if (!userId) {
      showError("Unable to identify this user");
      return;
    }

    setWorkingId(`${userId}-remove`);

    try {
      await removeTenantUser(tenantId, userId);
      setDeleteUser(null);
      await refresh();
    } catch (err) {
      showError(err?.message || "Failed to remove user");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <>
      <div className={`manage-roles-grid ${className}`}>
        <div className="card">
          <div className="card-header">
            <h3>Access List</h3>

            <div className="tenant-meta">
              {currentTenant?.baseName || "No organization selected"}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__title">
                No users have access
              </div>

              <div className="empty-state__text">
                Add users to this organization to grant access.
              </div>
            </div>
          ) : (
            <ul className="access-list">
              {users.map((membership) => {
                const user = membership.user || {};
                const userId = user._id || user.id;
                const itemKey =
                  userId || `${user.email}-${user.username}`;

                return (
                  <li key={itemKey} className="access-row">
                    <div className="access-info">
                      <div className="access-name">
                        {user.username || user.email || "Unknown"}
                      </div>

                      <div className="access-email">
                        {user.email || ""}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.6rem",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ minWidth: 160 }}>
                        <CustomSelect
                          name={`role-${itemKey}`}
                          value={membership.role}
                          onChange={(event) =>
                            handleChangeRole(
                              userId,
                              event.target.value
                            )
                          }
                          options={ROLES}
                          disabled={workingId !== null}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => openDeleteModal(user)}
                        disabled={workingId !== null || !userId}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        open={Boolean(deleteUser)}
        entity="user"
        item={deleteUser}
        loading={Boolean(workingId?.endsWith("-remove"))}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmRemove}
        title="Remove User"
        description={`You are about to remove ${
          deleteUser?.username || deleteUser?.email || "this user"
        } from the organization.`}
        warning="The user will lose access to this organization. This action cannot be undone."
        confirmLabel="Remove User"
        cancelLabel="Keep User"
        requireTypedConfirm={false}
      />
    </>
  );
}