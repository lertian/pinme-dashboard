import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getProjects, createProject, updateProjectVersion, deleteProject } from "../../utils/projects";
import { Project } from "../../types/project";
import ProjectCard from "./ProjectCard";
import Modal from "../../components/Common/Modal";
import Button from "../../components/Common/Button";
import Input from "../../components/Common/Input";
import Header from "../../components/Layout/Header";
import "./Dashboard.css";

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 上传新项目
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadType, setUploadType] = useState<"file" | "folder">("folder");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 更新项目
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [projectToUpdate, setProjectToUpdate] = useState<Project | null>(null);

    const fetchProjects = async () => {
        if (!user) return;
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (err: any) {
            setError("获取项目列表失败");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [user]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName || !selectedFiles || !user) return;

        setUploading(true);
        setUploadProgress(0);
        try {
            await createProject({
                name: projectName,
                files: selectedFiles,
            }, (progress) => {
                setUploadProgress(progress);
            });
            setIsUploadOpen(false);
            setProjectName("");
            setSelectedFiles(null);
            setUploadProgress(0);
            fetchProjects();
        } catch (err: any) {
            alert("上传失败: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectToUpdate || !selectedFiles) return;

        setUploading(true);
        setUploadProgress(0);
        try {
            await updateProjectVersion({
                projectId: projectToUpdate.id,
                files: selectedFiles,
            }, (progress) => {
                setUploadProgress(progress);
            });
            setIsUpdateOpen(false);
            setProjectToUpdate(null);
            setSelectedFiles(null);
            setUploadProgress(0);
            fetchProjects();
        } catch (err: any) {
            alert("更新失败: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (project: Project) => {
        if (!window.confirm(`确定要删除项目 "${project.name}" 吗？`)) return;
        try {
            await deleteProject(project.id);
            fetchProjects();
        } catch (err: any) {
            alert("删除失败");
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="dashboard-container">
            <Header />

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="title-section">
                        <h1 className="page-title">我的项目</h1>
                        <p className="page-subtitle">管理并部署您的静态网站</p>
                    </div>
                    <Button onClick={() => setIsUploadOpen(true)}>
                        + 上传新项目
                    </Button>
                </div>

                {loading ? (
                    <div className="loading-state">正在加载项目...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <p>您还没有上传过任何项目</p>
                        <Button onClick={() => setIsUploadOpen(true)}>立即上传第一个项目</Button>
                    </div>
                ) : (
                    <div className="project-grid">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onUpdate={(p) => {
                                    setProjectToUpdate(p);
                                    setIsUpdateOpen(true);
                                }}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* 上传对话框 */}
            <Modal
                isOpen={isUploadOpen}
                onClose={() => !uploading && setIsUploadOpen(false)}
                title=""
            >
                <div className="deploy-container">
                    <div className="deploy-header">
                        <h2 className="deploy-title">部署项目至 <span className="blue-text">演示服务器</span></h2>
                        <span className="option-badge">本地开发版</span>
                    </div>

                    <div className="upload-tabs">
                        <button
                            className={`tab-btn ${uploadType === 'file' ? 'active' : ''}`}
                            onClick={() => { setUploadType('file'); setSelectedFiles(null); }}
                            disabled={uploading}
                        >
                            <span className="tab-icon">📄</span> 单文件
                        </button>
                        <button
                            className={`tab-btn ${uploadType === 'folder' ? 'active' : ''}`}
                            onClick={() => { setUploadType('folder'); setSelectedFiles(null); }}
                            disabled={uploading}
                        >
                            <span className="tab-icon">📂</span> 文件夹
                        </button>
                    </div>

                    <form onSubmit={handleUpload}>
                        <div
                            className={`dropzone-area ${isDragging ? 'dragging' : ''} ${selectedFiles ? 'has-files' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                {...(uploadType === 'folder' ? { webkitdirectory: "", directory: "" } as any : {})}
                                multiple={uploadType === 'file'}
                                disabled={uploading}
                            />

                            <div className="dropzone-content">
                                <div className="dropzone-icon">
                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                        <rect x="12" y="10" width="40" height="44" rx="4" fill="#A5B4FC" />
                                        <path d="M24 24L18 30L24 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M40 24L46 30L40 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M35 18L29 42" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {selectedFiles ? (
                                    <div className="selected-files-info">
                                        <p className="file-count">已选择 {selectedFiles.length} 个项目文件</p>
                                        <p className="click-to-change">点击或拖拽以更换</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="drop-text">拖拽{uploadType === 'file' ? '文件' : '文件夹'}到这里 或 <span className="blue-link">点击上传</span></p>
                                        <p className="drop-hint">{uploadType === 'file' ? '建议上传 index.html 以获得最佳预览效果' : '请确保文件夹内包含 index.html'}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="project-name-input-wrapper">
                            <Input
                                label="项目名称"
                                placeholder="请输入项目名称"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                required
                                disabled={uploading}
                            />
                        </div>

                        {uploading && (
                            <div className="progress-container">
                                <div className="progress-bar-wrapper">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <div className="progress-info">
                                    <span>{uploadProgress === 100 ? '正在处理中...' : '正在上传...'}</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                            </div>
                        )}

                        <div className="build-tools-hint">
                            <h4 className="hint-title">支持的构建工具及目录：</h4>
                            <ul className="hint-list">
                                <li><strong>Vite:</strong> <code>dist/</code> <span className="hint-help" title="构建命令: npm run build">?</span></li>
                                <li><strong>React (CRA):</strong> <code>build/</code> <span className="hint-help" title="构建命令: npm run build">?</span></li>
                                <li><strong>Next.js:</strong> <code>out/</code> <span className="hint-help" title="构建命令: npm run build (需设置 output: 'export')">?</span></li>
                                <li><strong>Vue CLI:</strong> <code>dist/</code> <span className="hint-help" title="构建命令: npm run build">?</span></li>
                                <li><strong>Angular:</strong> <code>dist/</code> <span className="hint-help" title="构建命令: ng build">?</span></li>
                                <li><strong>静态站点:</strong> <code>root/</code> <span className="hint-help" title="说明: 直接上传包含 index.html 的打包后文件夹即可">?</span></li>
                            </ul>
                        </div>

                        <div className="modal-actions-v2">
                            <Button type="button" variant="secondary" onClick={() => setIsUploadOpen(false)} disabled={uploading}>取消</Button>
                            <Button type="submit" loading={uploading} disabled={!selectedFiles || !projectName}>部署项目</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* 更新对话框 */}
            <Modal
                isOpen={isUpdateOpen}
                onClose={() => !uploading && setIsUpdateOpen(false)}
                title=""
            >
                <div className="deploy-container">
                    <div className="deploy-header">
                        <h2 className="deploy-title">更新 <span className="blue-text">项目版本</span></h2>
                        <span className="option-badge">{projectToUpdate?.name}</span>
                    </div>

                    <div className="upload-tabs">
                        <button
                            className={`tab-btn ${uploadType === 'file' ? 'active' : ''}`}
                            onClick={() => { setUploadType('file'); setSelectedFiles(null); }}
                            disabled={uploading}
                        >
                            <span className="tab-icon">📄</span> 单文件
                        </button>
                        <button
                            className={`tab-btn ${uploadType === 'folder' ? 'active' : ''}`}
                            onClick={() => { setUploadType('folder'); setSelectedFiles(null); }}
                            disabled={uploading}
                        >
                            <span className="tab-icon">📂</span> 文件夹
                        </button>
                    </div>

                    <form onSubmit={handleUpdate}>
                        <div
                            className={`dropzone-area ${isDragging ? 'dragging' : ''} ${selectedFiles ? 'has-files' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                {...(uploadType === 'folder' ? { webkitdirectory: "", directory: "" } as any : {})}
                                multiple={uploadType === 'file'}
                                disabled={uploading}
                            />

                            <div className="dropzone-content">
                                <div className="dropzone-icon">
                                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                        <rect x="12" y="10" width="40" height="44" rx="4" fill="#A5B4FC" />
                                        <path d="M24 24L18 30L24 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M40 24L46 30L40 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M35 18L29 42" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {selectedFiles ? (
                                    <div className="selected-files-info">
                                        <p className="file-count">已选择 {selectedFiles.length} 个新文件</p>
                                        <p className="click-to-change">点击重新选择</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="drop-text">拖拽{uploadType === 'file' ? '文件' : '文件夹'}到这里 或 <span className="blue-link">点击上传</span></p>
                                        <p className="drop-hint">{uploadType === 'file' ? '建议上传 index.html 以获得最佳预览效果' : '请确保文件夹内包含 index.html'}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {uploading && (
                            <div className="progress-container">
                                <div className="progress-bar-wrapper">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <div className="progress-info">
                                    <span>{uploadProgress === 100 ? '正在处理中...' : '正在上传...'}</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                            </div>
                        )}

                        <div className="build-tools-hint">
                            <h4 className="hint-title">支持的构建工具及目录：</h4>
                            <ul className="hint-list">
                                <li><strong>Vite:</strong> <code>dist/</code> <span className="hint-help" title="构建命令: npm run build">?</span></li>
                                <li><strong>React (CRA):</strong> <code>build/</code> <span className="hint-help" title="构建命令: npm run build">?</span></li>
                                <li><strong>Next.js:</strong> <code>out/</code> <span className="hint-help" title="构建命令: npm run build (需设置 output: 'export')">?</span></li>
                                <li><strong>Vue CLI:</strong> <code>dist/</code> <span className="hint-help" title="构建命令: npm run build">?</span></li>
                                <li><strong>Angular:</strong> <code>dist/</code> <span className="hint-help" title="构建命令: ng build">?</span></li>
                                <li><strong>静态站点:</strong> <code>root/</code> <span className="hint-help" title="说明: 直接上传包含 index.html 的打包后文件夹即可">?</span></li>
                            </ul>
                        </div>

                        <div className="modal-actions-v2">
                            <Button type="button" variant="secondary" onClick={() => setIsUpdateOpen(false)} disabled={uploading}>取消</Button>
                            <Button type="submit" loading={uploading} disabled={!selectedFiles}>开始更新</Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
