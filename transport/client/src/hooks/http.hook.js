import { useState, useCallback } from 'react';

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setLoading(true);
        try {
            if (body) {
                body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, { method, body, headers });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 && data.message === 'jwt expired') {
                    await refreshToken();
                    headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                    return request(url, method, body, headers);
                } else if (response.status === 401 && data.message === 'refresh jwt expired') {
                    logout();
                }
                throw new Error(data.message || 'Something went wrong');
            }

            setLoading(false);
            return data;
        } catch (e) {
            setLoading(false);
            setError(e);
            throw e;
        }
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/refresh', { method: 'POST' });
            const data = await response.json();
            localStorage.setItem('token', data.token);
        } catch (error) {
            logout();
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        window.location.reload();
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { loading, request, error, clearError };
};
