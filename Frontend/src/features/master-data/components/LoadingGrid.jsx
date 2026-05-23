function LoadingGrid() {
  return (
    <div className="entity-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="entity-card entity-card--skeleton">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
        </div>
      ))}
    </div>
  );
}

export default LoadingGrid;