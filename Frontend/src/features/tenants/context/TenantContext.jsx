import { createContext, useContext, useEffect, useState } from "react";
import { getMyTenants } from "../services/tenantService.js";
import { useError } from "../../../shared/context/ErrorContext.jsx";

const TenantContext = createContext(null);
const CURRENT_TENANT_KEY = "currentTenant";
const CURRENT_TENANT_ID_KEY = "currentTenantId";

const deserializeTenant = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

const serializeTenant = (tenant) => {
  if (!tenant) return null;
  const id = tenant?._id || tenant?.id;
  if (!id) return null;
  return JSON.stringify({ ...tenant, _id: id?.toString?.() || id });
};

export function TenantProvider({ children }) {
  const { showError } = useError();

  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTenantId = (tenant) => {
    const id = tenant?._id || tenant?.id;
    return id?.toString?.() || id || null;
  };

  const saveCurrentTenant = (tenant) => {
    const id = getTenantId(tenant);
    if (!id) return;
    localStorage.setItem(CURRENT_TENANT_ID_KEY, id);
    const serialized = serializeTenant(tenant);
    if (serialized) {
      localStorage.setItem(CURRENT_TENANT_KEY, serialized);
    }
  };

  // Load tenants on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyTenants();
        const list = Array.isArray(data) ? data : data.data || [];
        setTenants(list);

        const storedTenant = deserializeTenant(localStorage.getItem(CURRENT_TENANT_KEY));
        const storedId = getTenantId(storedTenant) || localStorage.getItem(CURRENT_TENANT_ID_KEY);
        const restoredTenant = storedId
          ? list.find((t) => getTenantId(t) === storedId)
          : null;

        if (restoredTenant) {
          setCurrentTenant(restoredTenant);
          saveCurrentTenant(restoredTenant);
        } else if (list.length > 0) {
          setCurrentTenant(list[0]);
          saveCurrentTenant(list[0]);
        }
      } catch (err) {
        showError(err?.message || "Failed to load tenants");
        setTenants([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [showError]);

  const selectTenant = (tenant) => {
    const id = getTenantId(tenant);
    if (!id) return;

    setCurrentTenant(tenant);
    saveCurrentTenant(tenant);
  };

  const clearTenant = () => {
    setCurrentTenant(null);
    localStorage.removeItem(CURRENT_TENANT_KEY);
    localStorage.removeItem(CURRENT_TENANT_ID_KEY);
  };

  useEffect(() => {
    const id = currentTenant?._id?.toString?.() || currentTenant?.id;
    if (id) {
      localStorage.setItem("currentTenantId", id);
    } else {
      localStorage.removeItem("currentTenantId");
    }
  }, [currentTenant]);

  const value = {
    tenants,
    currentTenant,
    setTenants,
    selectTenant,
    clearTenant,
    loading
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}