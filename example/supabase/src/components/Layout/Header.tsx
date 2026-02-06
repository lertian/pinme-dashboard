import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Header.css";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="main-header">
            <div className="header-container">
                <div className="header-left">
                    <Link to="/" className="logo">演示项目管理</Link>
                    <button
                        className="help-icon-btn"
                        title="使用说明"
                        onClick={() => alert("【使用说明】\n1. 上传文件：支持直接拖拽 index.html 或静态资源文件。\n2. 上传文件夹：支持拖拽整个前端构建目录（如 dist/build）。\n3. 部署后：系统会自动生成一个本地预览链接。\n4. 更新项目：点击右侧“更新”可快速上传新版内容。")}
                    >
                        ?
                    </button>
                </div>

                <div className="header-right">
                    {user && (
                        <>
                            {user.is_admin && <Link to="/admin" className="nav-link">用户管理</Link>}
                            <Link to="/change-password" title="修改密码" className="nav-link">修改密码</Link>
                            <span className="welcome-text">欢迎, {user.username}</span>
                            <button onClick={handleLogout} className="logout-btn">退出</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
