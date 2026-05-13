export interface StorageUploadConfig {
    bucket: string;
    path: string;
    contentType: string;
    encryption?: {
        enabled: boolean;
        algorithm: 'AES-256-GCM';
        };
    metadata?: Record<string, string>;
}

export interface UploadResult {
    url: string;
    size: number;
    checksum: string;
    uploadedAt: number;
    expiresAt?: number;
}

export interface DownloadResult {
    data: Blob;
    url: string;
    contentType: string;
    size: number;
    checksum: string;
}

export interface StorageError extends Error {
    code: string;
    bucket?: string;
    path?: string;
    retryable: boolean;
}
