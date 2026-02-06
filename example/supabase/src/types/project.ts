export interface Project {
    id: string;
    user_id: string;
    name: string;
    current_cid: string | null;
    preview_url: string | null;
    domain: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_private: number;
    version_count?: number;
}

export interface ProjectVersion {
    id: string;
    project_id: string;
    version_number: number;
    ipfs_cid: string;
    preview_url: string;
    created_at: string;
}

export interface CreateProjectData {
    name: string;
    files: FileList | File[];
    domain?: string;
}

export interface UpdateProjectData {
    projectId: string;
    files: FileList | File[];
}
