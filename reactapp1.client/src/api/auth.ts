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
  
  // Заглушки для будущей интеграции с API
  export const login = async (email: string, password: string): Promise<string> => {
    // Заглушка: в реальности здесь будет запрос к API
    return Promise.resolve('fake-jwt-token');
  };
  
  export const register = async (email: string, password: string): Promise<string> => {
    // Заглушка: в реальности здесь будет запрос к API
    return Promise.resolve('fake-jwt-token');
  };