function EmptyState({ title, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">▦</div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__text">
        Use the action below to create the first item in this level.
      </p>
      <button type="button" className="primary-btn" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

export default EmptyState;