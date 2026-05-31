import EntityCardMenu from "./EntityCardMenu";

function getMeta(entity, item) {
  if (entity === "department") {
    const count = item.batchCount ?? 0;
    return `${count} ${count === 1 ? "batch" : "batches"}`;
  }

  if (entity === "batch") {
    const count = item.sectionCount ?? 0;
    return `${count} ${count === 1 ? "section" : "sections"}`;
  }

  const count = item.studentCount ?? 0;
  return `${count} ${count === 1 ? "student" : "students"}`;
}

function EntityCard({ entity, item, count = 0, onClick, onEdit, onDelete }) {
  return (
    <div className="entity-card" onClick={onClick}>
      <div className="entity-card__top">
        <div className="entity-card__body">
          <h3 className="entity-card__title">{item.name}</h3>
          <p className="entity-card__meta">{getMeta(entity, item, count)}</p>
        </div>

        <div className="entity-card__menu" onClick={(e) => e.stopPropagation()}>
          <EntityCardMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

export default EntityCard;