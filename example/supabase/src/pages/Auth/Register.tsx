import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../utils/auth";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import "./Auth.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("两次输入的密码不一致");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await register({ username, password, confirmPassword });
            navigate("/");
        } catch (err: any) {
            setError(err.message || "注册失败，请检查用户名是否已存在");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">创建账户</h2>
                <p className="auth-subtitle">开始管理您的 PinMe 项目</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="用户名"
                        placeholder="3-20 个字符"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        maxLength={20}
                    />
                    <Input
                        label="密码"
                        type="password"
                        placeholder="至少 6 个字符"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <Input
                        label="确认密码"
                        type="password"
                        placeholder="请再次输入密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" loading={loading} className="w-full">
                        注册
                    </Button>
                </form>

                <p className="auth-footer">
                    已有账户？ <Link to="/login">立即登录</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
