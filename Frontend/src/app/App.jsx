import { BrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes, { AppLayout } from "./routes/AppRoutes";
import "../styles/main.scss";
import Notification from "../shared/components/Notification";
import { ErrorProvider } from "../shared/context/ErrorContext";

function App() {
  return (
    <ErrorProvider>
      <Notification />
      <RouterProvider router={AppRoutes()}/>
    </ErrorProvider>
  );
}

export default App;