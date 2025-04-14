import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectDBPage from "./pages/ConnectDBPage";
import Workspace from "./pages/WorkspacePage";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage isLogin={true} />} />
          <Route path="/register" element={<AuthPage isLogin={false} />} />
          <Route path="/connect" element={<ConnectDBPage />} />
          <Route path="/" element={<Workspace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
export default App;
