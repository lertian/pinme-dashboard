import { LoginCredentials, RegisterData, User } from "../types/user";
import { request, setToken, clearToken } from "./api";

export const register = async (data: RegisterData): Promise<User> => {
    if (data.password !== data.confirmPassword) {
        throw new Error("密码不一致");
    }

    if (data.username.length < 3) {
        throw new Error("用户名至少 3 个字符");
    }

    const response = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username: data.username,
            password: data.password,
        }),
    });

    setToken(response.token);
    return response.user;
};

export const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    setToken(response.token);
    return response.user;
};

export const logout = async () => {
    clearToken();
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const user = await request('/auth/me');
        return user;
    } catch (err) {
        clearToken();
        return null;
    }
};
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
    });
};
