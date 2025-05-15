import { Navigate } from 'react-router-dom';
import { getToken } from '../api/auth';
import { ReactNode } from 'react';

interface AuthRedirectProps {
    children: ReactNode;
}

export default function PublicRoute({ children }: AuthRedirectProps) {
    const token = getToken();

    if (token) {
        return <Navigate to="/" replace />; // Перенаправляем на главную, если есть токен
    }

    return <>{children}</>;
}