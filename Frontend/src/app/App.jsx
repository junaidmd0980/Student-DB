import { BrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "../styles/main.scss";
import Notification from "../shared/components/Notification";
import { ErrorProvider } from "../shared/context/ErrorContext";

function App() {
  return (
    <ErrorProvider>
      <RouterProvider router={AppRoutes}>

        <Notification />
      </RouterProvider>
    </ErrorProvider>
  );
}

export default App;