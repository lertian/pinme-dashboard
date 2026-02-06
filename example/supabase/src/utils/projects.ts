import axios from "axios";
import { Project, CreateProjectData, UpdateProjectData } from "../types/project";
import { API_BASE_URL } from "./api";

export const getProjects = async (): Promise<Project[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
};

export const createProject = async (
    data: CreateProjectData,
    onProgress?: (progress: number) => void
): Promise<Project> => {
    const formData = new FormData();
    formData.append('name', data.name);

    const fileArray = Array.from(data.files);
    fileArray.forEach(file => {
        // 尝试获取相对路径（用于文件夹上传），如果不存在则使用文件名
        const relativePath = (file as any).webkitRelativePath || file.name;
        formData.append('files', file, relativePath);
    });

    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/projects`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });

    return response.data;
};

export const updateProjectVersion = async (
    data: UpdateProjectData,
    onProgress?: (progress: number) => void
): Promise<void> => {
    const formData = new FormData();

    const fileArray = Array.from(data.files);
    fileArray.forEach(file => {
        const relativePath = (file as any).webkitRelativePath || file.name;
        formData.append('files', file, relativePath);
    });

    const token = localStorage.getItem('token');
    await axios.post(`${API_BASE_URL}/projects/${data.projectId}/update`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
};

export const toggleProjectPrivacy = async (projectId: string): Promise<{ is_private: number }> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/toggle-private`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    return response.data;
};
