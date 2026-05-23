import { useEffect, useState } from "react";
import { getDepartments } from "../../master-data/services/departmentService";
import { getBatches } from "../../master-data/services/batchService";
import CustomSelect from "../../../shared/components/CustomSelect";

function StudentFilters({ filters, setFilters }) {
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : data.data || []);
      } catch {
        setDepartments([]);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    const loadBatches = async () => {
      if (!filters.department) {
        setBatches([]);
        return;
      }

      try {
        const data = await getBatches({ department: filters.department });
        setBatches(Array.isArray(data) ? data : data.data || []);
      } catch {
        setBatches([]);
      }
    };

    loadBatches();
  }, [filters.department]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      if (name === "department") {
        return {
          ...prev,
          department: value,
          batch: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <div className="card filter-card">
      <div className="filter-grid">
        <input
          type="text"
          name="search"
          placeholder="Search by roll no or name"
          value={filters.search}
          onChange={handleChange}
        />

        <CustomSelect
          name="department"
          value={filters.department}
          onChange={handleChange}
          options={[
            { label: "All Departments", value: "" },
            ...departments.map((department) => ({
              label: department.name,
              value: department._id || department.id,
            }))
          ]}
        />

        <CustomSelect
          name="batch"
          value={filters.batch}
          onChange={handleChange}
          options={[
            { label: "All Batches", value: "" },
            ...batches.map((batch) => ({
              label: batch.name,
              value: batch._id || batch.id,
            }))
          ]}
          disabled={!filters.department}
        />
      </div>
    </div>
  );
}

export default StudentFilters;