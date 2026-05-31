function Loader({ text = "Loading...", size = "md", centered = true }) {
  return (
    <div
      className={`loader-wrap ${centered ? "loader-wrap--centered" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className={`loader loader--${size}`} aria-hidden="true">
        <span className="loader__ring loader__ring--track" />
        <span className="loader__ring loader__ring--arc" />
        <span className="loader__core" />
      </div>

      {text ? <p className="loader__text">{text}</p> : null}

      <span className="sr-only">{text}</span>
    </div>
  );
}

export default Loader;