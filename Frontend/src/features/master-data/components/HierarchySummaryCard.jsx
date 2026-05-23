function HierarchySummaryCard({ title, count, description, onClick }) {
  return (
    <button
      type="button"
      className="summary-card"
      onClick={onClick}
    >
      <div className="summary-card__content">
        <span className="summary-card__eyebrow">Overview</span>
        <h2 className="summary-card__title">{title}</h2>
        <p className="summary-card__count">{count}</p>
        <p className="summary-card__description">{description}</p>
      </div>

    </button>
  );
}

export default HierarchySummaryCard;