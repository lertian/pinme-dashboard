import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/user";
import { getCurrentUser, logout as authLogout } from "../utils/auth";
import { getToken as getApiToken } from "../utils/api";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (err) {
            console.error("刷新用户失败:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 初始化时同步 token 到 cookie
        const token = getApiToken();
        if (token && !document.cookie.includes('token=')) {
            console.log('同步 Token 到 Cookie');
            // 这里我们手动设置一下 cookie，虽然 setToken 会设，但我们需要处理已登录用户的情况
            document.cookie = `token=${token}; path=/; max-age=604800`;
        }
        refreshUser();
    }, []);

    const logout = async () => {
        await authLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
