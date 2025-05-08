import api from "./client";

// Статичная реализация
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('token');
};

// auth.ts
type ApiResponse = {
    success: boolean;
    token?: string;
    error?: string;
};

export const login = async (email: string, password: string): Promise<{
    status: string;
    token?: string;
    error?: string
}> => {
    try {
        const payload = { email, password };
        const res = await api.post('/login', payload) as ApiResponse;

        if (res?.success === true && res.token) {
            setToken(res.token);
            return {
                status: 'success',
                token: res.token
            };
        }

        return {
            status: 'error',
            error: res?.error || 'Login failed'
        };
    } catch (error) {
        console.error(error);
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const register = async (
    email: string,
    password: string,
    password2: string
): Promise<{ status: string; error?: string }> => {
    try {
        if (password !== password2) {
            return { status: 'error', error: 'Passwords do not match' };
        }

        const res = await api.post('/register', { email, password }) as ApiResponse;

        if (res?.success === true) {
            return { status: 'success' };
        }

        return { status: 'error', error: res?.error || 'Registration failed' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
};