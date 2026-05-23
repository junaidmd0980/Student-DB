import { useState } from "react";
import StudentFilters from "../components/StudentFilters";
import StudentTable from "../components/StudentTable";

function StudentListPage() {
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    batch: "",
  });

  return (
    <div className="page student-list-page">
      <div className="container">
        <h1 className="form-title">Students</h1>
        <StudentFilters filters={filters} setFilters={setFilters} />
        <StudentTable filters={filters} />
      </div>
    </div>
  );
}

export default StudentListPage;