import CreateEntityCard from "./CreateEntityCard";
import EntityCard from "./EntityCard";

function EntityGrid({
  entity,
  items = [],
  onCreate,
  onCardClick,
  onEdit,
  onDelete,
}) {
  return (
    <div className="entity-grid">
      <CreateEntityCard entity={entity} onClick={onCreate} />

      {items.map((item) => (
        <EntityCard
          key={item._id || item.id}
          entity={entity}
          item={item}
          onClick={onCardClick ? () => onCardClick(item) : undefined}
          onEdit={() => onEdit(entity, item)}
          onDelete={() => onDelete(entity, item)}
        />
      ))}
    </div>
  );
}

export default EntityGrid;