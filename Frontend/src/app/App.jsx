import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "../styles/main.scss";
import Notification from "../shared/components/Notification";
import { ErrorProvider } from "../shared/context/ErrorContext";

function App() {
  return (
    <ErrorProvider>
      <BrowserRouter>
        <Notification />
        <AppRoutes />
      </BrowserRouter>
    </ErrorProvider>
  );
}

export default App;