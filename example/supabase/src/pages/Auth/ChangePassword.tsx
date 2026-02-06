import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../utils/auth";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import Header from "../../components/Layout/Header";
import "./Auth.css";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("新密码与确认密码不一致");
            return;
        }

        if (newPassword.length < 6) {
            setError("新密码至少需要 6 个字符");
            return;
        }

        setLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "修改密码失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-page">
            <Header />
            <main className="auth-container">
                <div className="auth-card card">
                    <h1 className="auth-title">修改密码</h1>
                    <p className="auth-subtitle">为了您的账户安全，请定期更换密码</p>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">密码修改成功！正在返回首页...</div>}

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="当前密码"
                            type="password"
                            placeholder="请输入当前密码"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="新密码"
                            type="password"
                            placeholder="请输入新密码"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="确认新密码"
                            type="password"
                            placeholder="请再次输入新密码"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <div className="auth-actions">
                            <Button type="submit" loading={loading} className="auth-button">
                                提交修改
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate("/")}
                                disabled={loading}
                            >
                                取消
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ChangePassword;
