function HierarchyBreadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="hierarchy-breadcrumbs" aria-label="Breadcrumb">
      <ol className="hierarchy-breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="hierarchy-breadcrumbs__item">
              {isLast || !item.onClick ? (
                <span
                  className="hierarchy-breadcrumbs__current"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  className="hierarchy-breadcrumbs__link"
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              )}

              {!isLast && (
                <span className="hierarchy-breadcrumbs__separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default HierarchyBreadcrumbs;