import axios from 'axios';

const api = axios.create({
    // Pointing to your local backend for testing
    baseURL: 'http://localhost:8081/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach the JWT token to every request if the user is logged in
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;