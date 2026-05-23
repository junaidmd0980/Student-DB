import { useCallback, useState } from "react";
import LabSessionFilters from "../components/LabSessionFilters";
import LabSessionTable from "../components/LabSessionTable";

function LabSessionsPage() {
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    batch: "",
    section: "",
    status: "",
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const handleSessionCreated = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="page lab-session-page">
      <div className="container">
        <h1 className="form-title">Lab Sessions</h1>

        <LabSessionFilters
          filters={filters}
          setFilters={setFilters}
          onSessionCreated={handleSessionCreated}
        />

        <LabSessionTable
          filters={filters}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}

export default LabSessionsPage;