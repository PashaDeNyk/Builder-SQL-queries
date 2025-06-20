import { Navigate } from 'react-router-dom';
import { getToken } from '../api/auth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = getToken();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}