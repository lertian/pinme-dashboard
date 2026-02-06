import { useState, useEffect } from "react";
import { getAllUsers, resetUserPassword } from "../../utils/admin";
import Header from "../../components/Layout/Header";
import Modal from "../../components/Common/Modal";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import "./UserManagement.css";

const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isResetOpen, setIsResetOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState("");
    const [resetting, setResetting] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUser || !newPassword) return;

        setResetting(true);
        try {
            await resetUserPassword(targetUser.id, newPassword);
            alert("密码已重置成功");
            setIsResetOpen(false);
            setNewPassword("");
        } catch (err: any) {
            alert("重置失败: " + err.message);
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="admin-container">
            <Header />
            <main className="admin-main">
                <h1 className="page-title">用户管理</h1>
                <p className="page-subtitle">管理员控制台：查看注册用户及重置密码</p>

                {loading ? (
                    <div>正在加载用户列表...</div>
                ) : (
                    <div className="table-container card">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>用户名</th>
                                    <th>注册时间</th>
                                    <th>项目数</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <span className="username-cell">
                                                {user.username}
                                                {user.is_admin && <span className="admin-badge">管理员</span>}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>{user.projects?.[0]?.count || 0}</td>
                                        <td>
                                            <button
                                                className="text-btn"
                                                onClick={() => {
                                                    setTargetUser(user);
                                                    setIsResetOpen(true);
                                                }}
                                            >
                                                重置密码
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <Modal
                isOpen={isResetOpen}
                onClose={() => setIsResetOpen(false)}
                title={`重置密码: ${targetUser?.username}`}
            >
                <form onSubmit={handleReset}>
                    <Input
                        label="新密码"
                        type="password"
                        placeholder="请输入新密码"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={() => setIsResetOpen(false)}>取消</Button>
                        <Button type="submit" loading={resetting} variant="danger">确定重置</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
