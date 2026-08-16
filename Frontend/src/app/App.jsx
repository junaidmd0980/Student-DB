import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "../styles/main.scss";
import { AuthProvider } from "../Auth/context/AuthContext.jsx";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;