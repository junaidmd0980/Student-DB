import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HierarchyBreadcrumbs from "../../master-data/components/HierarchyBreadcrumbs.jsx";
import { useTenant } from "../context/TenantContext.jsx";
import {
  addTenantUser,
  changeTenantUserRole,
  createTenant,
  deleteTenant,
  getMyTenants,
  removeTenantUser,
  updateTenant
} from "../services/tenantService.js";
import { useError } from "../../../shared/context/ErrorContext.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import DeleteConfirmModal from "../../../shared/components/DeleteConfirmModel.jsx";
import { MoreVertical, Search, Plus } from "lucide-react";
import CustomSelect from "../../../shared/components/CustomSelect";

const tenantRoles = ["admin", "faculty", "viewer"];

export default function TenantsPage({ onSelectTenant, embedded = false }) {
  const { tenants, setTenants, currentTenant, selectTenant, clearTenant, loading } = useTenant();
  const noun = embedded ? "Institution" : "Organization";
  const nounLower = embedded ? "institution" : "organization";
  const { showError } = useError();
  const navigate = useNavigate();

  // breadcrumbs for non-embedded view
  const breadcrumbs = !embedded ? [
    { label: "Overview", onClick: () => navigate && navigate('/dashboard') },
    { label: noun + " Management", onClick: null }
  ] : [];

  const [creating, setCreating] = useState(false);
  const [working, setWorking] = useState(false);
  const [baseName, setBaseName] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState(currentTenant?._id || currentTenant?.id || null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [memberIdentifier, setMemberIdentifier] = useState("");
  const [memberRole, setMemberRole] = useState("viewer");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [actionTenant, setActionTenant] = useState(null);

  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [manageTenant, setManageTenant] = useState(null);
  const [manageIdentifier, setManageIdentifier] = useState("");
  const [manageRole, setManageRole] = useState("viewer");

  const selectedTenant = useMemo(() => {
    return tenants.find((t) => (t._id || t.id) === selectedTenantId) || currentTenant || null;
  }, [tenants, selectedTenantId, currentTenant]);

  useEffect(() => {
    if (!selectedTenant) return;
    setEditName(selectedTenant.baseName || "");
    setEditStatus(selectedTenant.status || "active");
  }, [selectedTenant]);

  const filteredTenants = useMemo(() => {
    if (!search.trim()) return tenants;
    const q = search.trim().toLowerCase();
    return tenants.filter((t) => (t.baseName || "").toLowerCase().includes(q));
  }, [tenants, search]);

  const refreshTenants = async () => {
    try {
      const list = await getMyTenants();
      const normalized = Array.isArray(list) ? list : list.data || [];
      setTenants(normalized);
      return normalized;
    } catch (err) {
      showError(err?.message || "Failed to refresh tenants");
      return [];
    }
  };

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    if (!baseName.trim()) return;

    try {
      setCreating(true);
      const res = await createTenant({ baseName: baseName.trim() });
      const newTenant = res?.data || res;
      const tenantToSelect = newTenant?.data || newTenant;

      const normalized = await refreshTenants();
      if (tenantToSelect?._id) {
        selectTenant(tenantToSelect);
        setSelectedTenantId(tenantToSelect._id);
      }

      onSelectTenant?.(tenantToSelect);
      setBaseName("");
      setIsCreateOpen(false);
    } catch (err) {
      showError(err?.message || "Failed to create tenant");
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (tenant) => {
    selectTenant(tenant);
    setSelectedTenantId(tenant._id || tenant.id);
  };

  const openEditModal = (tenant) => {
    setActionTenant(tenant);
    setEditName(tenant.baseName || "");
    setEditStatus(tenant.status || "active");
    setIsEditOpen(true);
    setMenuOpenId(null);
  };

  const openDeleteModal = (tenant) => {
    setActionTenant(tenant);
    setIsDeleteOpen(true);
    setMenuOpenId(null);
  };

  const handleUpdateTenant = async () => {
    const target = actionTenant || selectedTenant;
    if (!target) return;
    if (!editName.trim()) {S
      showError("Tenant name cannot be empty");
      return;
    }

    try {
      setWorking(true);
      await updateTenant(target._id || target.id, {
        baseName: editName.trim(),
        status: editStatus
      });
      const normalized = await refreshTenants();
      const updated = normalized.find((t) => (t._id || t.id) === (target._id || target.id));
      if (updated) {
        handleSelect(updated);
      }
      setIsEditOpen(false);
      setActionTenant(null);
    } catch (err) {
      showError(err?.message || "Failed to update tenant");
    } finally {
      setWorking(false);
    }
  };
  const openManageRoles = (tenant) => {
    setManageTenant(tenant);
    setManageIdentifier("");
    setManageRole("viewer");
    setIsManageRolesOpen(true);
    setMenuOpenId(null);
  };

  const handleManageAddUser = async () => {
    const target = manageTenant;
    if (!target) return;
    if (!manageIdentifier.trim()) {
      showError("Enter a username or email to add");
      return;
    }

    try {
      setWorking(true);
      await addTenantUser(target._id || target.id, { identifier: manageIdentifier.trim(), role: manageRole });
      const normalized = await refreshTenants();
      const updated = normalized.find((t) => (t._id || t.id) === (target._id || target.id));
      if (updated) setManageTenant(updated);
      setManageIdentifier("");
      setManageRole("viewer");
    } catch (err) {
      showError(err?.message || "Failed to add user");
    } finally {
      setWorking(false);
    }
  };

  const handleManageRemoveUser = async (userId) => {
    const target = manageTenant;
    if (!target) return;
    const confirmed = window.confirm("Remove this user from the tenant?");
    if (!confirmed) return;

    try {
      setWorking(true);
      await removeTenantUser(target._id || target.id, userId);
      const normalized = await refreshTenants();
      const updated = normalized.find((t) => (t._id || t.id) === (target._id || target.id));
      if (updated) setManageTenant(updated);
    } catch (err) {
      showError(err?.message || "Failed to remove user");
    } finally {
      setWorking(false);
    }
  };

  const handleManageChangeRole = async (userId, role) => {
    const target = manageTenant;
    if (!target) return;

    try {
      setWorking(true);
      await changeTenantUserRole(target._id || target.id, userId, role);
      const normalized = await refreshTenants();
      const updated = normalized.find((t) => (t._id || t.id) === (target._id || target.id));
      if (updated) setManageTenant(updated);
    } catch (err) {
      showError(err?.message || "Failed to change role");
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteTenant = async () => {
    const target = actionTenant || selectedTenant;
    if (!target) return;

    try {
      setWorking(true);
      await deleteTenant(target._id || target.id);
      const normalized = await refreshTenants();
      const nextTenant = normalized[0] || null;
      if (nextTenant) {
        selectTenant(nextTenant);
        setSelectedTenantId(nextTenant._id || nextTenant.id);
      } else {
        clearTenant();
        setSelectedTenantId(null);
      }
      setIsDeleteOpen(false);
      setActionTenant(null);
    } catch (err) {
      showError(err?.message || "Failed to delete tenant");
    } finally {
      setWorking(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedTenant) return;
    if (!memberIdentifier.trim()) {
      showError("Enter a username or email to add");
      return;
    }

    try {
      setWorking(true);
      await addTenantUser(selectedTenant._id || selectedTenant.id, {
        identifier: memberIdentifier.trim(),
        role: memberRole
      });
      const normalized = await refreshTenants();
      const updated = normalized.find((t) => (t._id || t.id) === selectedTenantId);
      if (updated) {
        handleSelect(updated);
      }
      setMemberIdentifier("");
      setMemberRole("viewer");
    } catch (err) {
      showError(err?.message || "Failed to add user");
    } finally {
      setWorking(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!selectedTenant) return;
    const confirmed = window.confirm("Remove this user from the tenant?");
    if (!confirmed) return;

    try {
      setWorking(true);
      await removeTenantUser(selectedTenant._id || selectedTenant.id, userId);
      const normalized = await refreshTenants();
      const updated = normalized.find((t) => (t._id || t.id) === selectedTenantId);
      if (updated) {
        handleSelect(updated);
      }
    } catch (err) {
      showError(err?.message || "Failed to remove user");
    } finally {
      setWorking(false);
    }
  };

  const handleChangeRole = async (userId, role) => {
    if (!selectedTenant) return;

    try {
      setWorking(true);
      await changeTenantUserRole(selectedTenant._id || selectedTenant.id, userId, role);
      const normalized = await refreshTenants();
      const updated = normalized.find((t) => (t._id || t.id) === selectedTenantId);
      if (updated) {
        handleSelect(updated);
      }
    } catch (err) {
      showError(err?.message || "Failed to change role");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return <Loader text={`Loading ${nounLower}s...`} />;
  }

  return (
    <div className="page tenants-page">
      <div className="container">
        {!embedded && (
          <div>
            <h1 className="page-title">{noun} Management</h1>
            <p className="page-subtitle">Create new {nounLower}s, choose one to manage, and control user access per {nounLower}.</p>
          </div>
        )}
        {!embedded && <HierarchyBreadcrumbs items={breadcrumbs} />}
        {isCreateOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="modal-header">
                  <h2>Create {noun}</h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
                className="edit-form"
              >
                <div className="form-group">
                  <label htmlFor="create-tenant-name">{noun} Name</label>
                  <input
                    id="create-tenant-name"
                    type="text"
                    value={baseName}
                    onChange={(e) => setBaseName(e.target.value)}
                    required
                  />
                </div>
                <div className="delete-actions">
                  <button type="submit" className="table-action" disabled={creating}>
                    {creating ? `Creating ${noun}...` : `Create ${noun}`}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={creating}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditOpen && (
          <div className="modal-overlay" onClick={() => { setIsEditOpen(false); setActionTenant(null); }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="modal-header">
                <h2>Update {noun}</h2>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateTenant(); }} className="edit-form">
                <div className="form-group">
                  <label htmlFor="edit-tenant-name">{noun} Name</label>
                  <input
                    id="edit-tenant-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    disabled={working}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-tenant-status">Status</label>
                  <CustomSelect
                    name="status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]}
                    disabled={working}
                  />
                </div>

                <div className="delete-actions">
                  <button type="submit" className="table-action" disabled={working}>{working ? "Saving..." : "Save Changes"}</button>
                  <button type="button" className="btn-secondary" onClick={() => { setIsEditOpen(false); setActionTenant(null); }} disabled={working}>Cancel</button>
                </div>
              </form>
              
            </div>
          </div>
        )}

        <DeleteConfirmModal
          open={isDeleteOpen}
          entity={nounLower}
          item={actionTenant}
          loading={working}
          onClose={() => { setIsDeleteOpen(false); setActionTenant(null); }}
          onConfirm={handleDeleteTenant}
          title={`Delete ${noun}`}
          description={`You are about to delete ${actionTenant?.baseName || `this ${nounLower}`}.`}
          warning={`This action will permanently delete this ${nounLower} and its data.`}
          confirmLabel={`Delete ${noun}`}
          cancelLabel={`Keep ${noun}`}
          requireTypedConfirm={true}
          confirmKeyword={actionTenant?.baseName || ""}
        />

        

        <div className="card filter-card">
          <div className="filter-grid">
            <div className="search-input">
              <Search size={16} />
              <input
                      type="text"
                      name="search"
                      placeholder={`Search ${nounLower}s`}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
            </div>
          </div>
          <div className="actions-right">
            <button type="button" className="table-action" onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} />
              Create {noun}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Existing {noun}s</h2>
            <div className="tenant-count">{filteredTenants.length} {nounLower}{filteredTenants.length !== 1 ? "s" : ""}</div>
          </div>

          {filteredTenants.length === 0 ? (
            <p className="empty-state">No {nounLower}s found.</p>
          ) : (
            <ul className="tenant-grid">
              {filteredTenants.map((tenant) => {
                const id = tenant._id || tenant.id;
                const isActive = selectedTenant && (selectedTenant._id || selectedTenant.id) === id;

                return (
                  <li key={id} className={`tenant-card-item ${isActive ? "tenant-item--active" : ""}`}>
                    <div className="tenant-main">
                      <div>
                        <strong>{tenant.baseName}</strong>
                        <div className="meta">Status: {tenant.status || "active"}</div>
                      </div>
                      <div className="tenant-actions">
                        <button
                          type="button"
                          className={isActive ? "secondary-btn" : "primary-btn"}
                          onClick={() => handleSelect(tenant)}
                        >
                          {isActive ? "Selected" : "Select"}
                        </button>
                        <div className="menu-wrapper">
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label="tenant menu"
                            onClick={() => setMenuOpenId(menuOpenId === id ? null : id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {menuOpenId === id && (
                            <div className="menu-popover">
                              <button type="button" onClick={() => openEditModal(tenant)}>Update</button>
                              <button type="button" onClick={() => openDeleteModal(tenant)}>Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
