/**
 * IPFS 上传工具函数
 * 目前使用模拟上传，实际应用中应调用 PinMe API
 */
export const uploadToIPFS = async (files: FileList | File[]): Promise<{ cid: string; previewUrl: string }> => {
    console.log("正在上传文件列表:", files);

    // 模拟上传延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 检查是否包含 index.html (如果是目录上传)
    let hasIndex = false;
    const fileArray = Array.from(files);
    for (const file of fileArray) {
        if (file.name === "index.html" || (file as any).webkitRelativePath?.endsWith("index.html")) {
            hasIndex = true;
            break;
        }
    }

    // 基础逻辑：至少需要一个文件
    if (fileArray.length === 0) {
        throw new Error("请选择要上传的文件");
    }

    // 模拟 CID 生成
    const mockCid = "Qm" + Math.random().toString(36).substring(2, 12) + "pinme";
    const previewUrl = `https://${mockCid}.pinit.eth.limo`;

    return {
        cid: mockCid,
        previewUrl: previewUrl,
    };
};

/**
 * 验证文件夹是否包含 index.html
 */
export const validateProjectFiles = (files: FileList | File[]): boolean => {
    const fileArray = Array.from(files);
    return fileArray.some(file =>
        file.name === "index.html" || (file as any).webkitRelativePath?.endsWith("index.html")
    );
};
