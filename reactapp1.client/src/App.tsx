import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectDBPage from "./pages/ConnectDBPage";
import Workspace from "./pages/WorkspacePage";
import PublicRoute from "./components/PublicRoute";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <AuthPage isLogin={true} />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <AuthPage isLogin={false} />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/connect"
                        element={
                            <ProtectedRoute>
                                <ConnectDBPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Workspace />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                </BrowserRouter>
        </QueryClientProvider>
    );
}
export default App;
