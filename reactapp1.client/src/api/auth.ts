import api from "./client";

export const getToken = (): string | null => {
    return sessionStorage.getItem('token');
};

export const setToken = (token: string): void => {
    sessionStorage.setItem('token', token);
};

export const removeToken = (): void => {
    sessionStorage.removeItem('token');
};

type ApiResponse = {
    success: boolean;
    token?: string;
    error?: string;
    data?: {}
};

export const login = async (email: string, password: string): Promise<{
    status: string;
    token?: string;
    error?: string
}> => {
    try {
        const payload = { email, password };
        const res = await api.post('/login', payload) as ApiResponse;
        console.log(res.data);
        const correctedResponse = res!.data!.replace(/"\s+"/g, '", "').replace('":"', '": "')
            .replace(/"token":\s*([^\s"]+)/g, '"token": "$1"');
        const ser = JSON.parse(`{${correctedResponse}}`);
        if (ser.status === 'success' && ser.token) {
            setToken(ser.token);
            console.log('UPI U UPI E');
            return {
                status: 'success',
                token: ser.token
            };
        }

        return {
            status: 'error',
            error: ser?.error || 'Login failed'
        };
    } catch (error) {
        const errorText = error!.response.data.match(/"error":\s*([^"][^,}]*)/)?.[1]?.trim() || "Unknown error";
        const correctedError = error!.response.data
            .replace(/"error":\s*([^"][^,}]*)/, `"error": "${errorText}"`)
            .replace(/"\s+"/g, '", "');
        console.error(`{${correctedError}}`);
        const ser = JSON.parse(`{${correctedError}}`);
        console.error(ser);
        return {
            status: 'error',
            error: error instanceof Error ? ser.message : 'Unknown error'
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

        const res = await api.post('/register', { email, password, password2 }) as ApiResponse;
        console.log(res);
        console.log(res.status);
        if (res.status == 200) return { status: 'success' };
        if (res?.success === true) {
            return { status: 'success' };
        }

        if (res.data === 'Пользователь зарегистрирован') return { status: 'success' };
        if (res.status == 400) console.log(res.data, res.response);

        console.log(res.data, res.response);

        return { status: 'error', error: res?.response.data || 'Registration failed' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error instanceof Error ? error.response.data : 'Unknown error' };
    }
};