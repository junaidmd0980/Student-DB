import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../Auth/context/AuthContext.jsx";

function ProtectedRoute() {
  const { accessToken, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;