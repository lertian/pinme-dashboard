const API_BASE_URL = 'http://localhost:3001/api';

// 获取 token
const getToken = () => localStorage.getItem('token');

// 设置 token
const setToken = (token: string) => {
    localStorage.setItem('token', token);
    // 同时存入 Cookie，以便浏览器直接访问时可以携带
    document.cookie = `token=${token}; path=/; max-age=604800`; // 7天过期
};

// 清除 token
const clearToken = () => {
    localStorage.removeItem('token');
    // 同时清除 Cookie
    document.cookie = 'token=; path=/; max-age=0';
};

// 通用请求函数
const request = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: 'include', // 携带 Cookie
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '请求失败');
    }

    return response.json();
};

export { request, getToken, setToken, clearToken, API_BASE_URL };
