const entityLabels = {
  department: "Create Department",
  batch: "Create Batch",
  section: "Create Section",
};

const helperLabels = {
  department: "Add a new department",
  batch: "Add a new batch",
  section: "Add a new section",
};

function CreateEntityCard({ entity, onClick }) {
  return (
    <button
      type="button"
      className="entity-card entity-card--create"
      onClick={onClick}
    >
      <div className="entity-card--create__icon" aria-hidden="true">
        +
      </div>
      <h3 className="entity-card__title">{entityLabels[entity]}</h3>
      <p className="entity-card__meta">{helperLabels[entity]}</p>
    </button>
  );
}

export default CreateEntityCard;