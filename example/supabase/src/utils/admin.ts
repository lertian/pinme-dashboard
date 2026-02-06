import { request } from "./api";

export const getAllUsers = async (): Promise<any[]> => {
    const users = await request('/admin/users');
    return users;
};

export const resetUserPassword = async (userId: string, newPassword: string): Promise<void> => {
    await request(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
    });
};
