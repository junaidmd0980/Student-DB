import { useEffect, useState } from "react";
import { useError } from "../context/ErrorContext.jsx";

const Notification = () => {
  const { error, clearError } = useError();
  const [visibleError, setVisibleError] = useState("");

  useEffect(() => {
    if (error) {
      setVisibleError(error);
      
      const timer = setTimeout(() => {
        setVisibleError("");
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!visibleError) return null;

  const closeNotification = () => {
    setVisibleError("");
    clearError();
  };

  return (
    <div className="top-notification">
      <div className="notification-inner">
        <div className="notification-icon" aria-hidden="true">
          !
        </div>
        <span>{visibleError}</span>
        <button onClick={closeNotification} className="close-notif">
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;