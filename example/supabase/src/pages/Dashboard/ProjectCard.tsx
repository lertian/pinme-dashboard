import React from "react";
import { Project } from "../../types/project";
import { toggleProjectPrivacy } from "../../utils/projects";
import "./ProjectCard.css";

interface ProjectCardProps {
    project: Project;
    onUpdate: (project: Project) => void;
    onDelete: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete }) => {
    const formattedDate = new Date(project.updated_at).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const isPrivate = project.is_private === 1;

    const handleTogglePrivacy = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await toggleProjectPrivacy(project.id);
            window.location.reload();
        } catch (err: any) {
            alert("切换失败: " + err.message);
        }
    };

    return (
        <div className="project-card">
            <div className="project-card-header">
                <h3 className="project-name">{project.name}</h3>
                <span className="project-status">已部署</span>
            </div>

            <div className="project-card-body">
                <div className="project-info">
                    <span className="info-label">最新更新:</span>
                    <span className="info-value">{formattedDate}</span>
                </div>
                <div className="project-info">
                    <span className="info-label">CID:</span>
                    <span className="info-value cid-text" title={project.current_cid || ""}>
                        {project.current_cid ? `${project.current_cid.substring(0, 8)}...${project.current_cid.slice(-4)}` : "无"}
                    </span>
                </div>
            </div>

            <div className="project-card-footer">
                <a
                    href={project.preview_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action preview-btn"
                >
                    预览
                </a>
                <button
                    onClick={handleTogglePrivacy}
                    className={`btn-action visibility-btn ${isPrivate ? 'private' : 'public'}`}
                    title={isPrivate ? "设为公开访问" : "设为私有访问"}
                >
                    <span className="v-icon">{isPrivate ? '🔒' : '🌍'}</span>
                    {isPrivate ? '私享' : '公开'}
                </button>
                <button
                    onClick={() => onUpdate(project)}
                    className="btn-action update-btn"
                >
                    更新版本
                </button>
                <button
                    onClick={() => onDelete(project)}
                    className="btn-action delete-btn"
                >
                    删除
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
