import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { login } from "../../utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import "./Auth.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    useEffect(() => {
        if (redirectUrl) {
            console.log('登录成功后将跳转到:', redirectUrl);
            // 如果用户已经登录，直接跳转
            const token = localStorage.getItem('token');
            if (token) {
                // 确保 cookie 也存在
                if (!document.cookie.includes('token=')) {
                    document.cookie = `token=${token}; path=/; max-age=604800`;
                }
                window.location.href = redirectUrl;
            }
        }
    }, [redirectUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login({ username, password });
            await refreshUser();

            // 如果有 redirect 参数，跳转到指定页面
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                navigate("/");
            }
        } catch (err: any) {
            setError(err.message || "登录失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">欢迎回来</h2>
                <p className="auth-subtitle">请登录您的账户</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="用户名"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        label="密码"
                        type="password"
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" loading={loading} className="w-full">
                        登录
                    </Button>
                </form>

                <p className="auth-footer">
                    还没有账户？ <Link to="/register">立即注册</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
