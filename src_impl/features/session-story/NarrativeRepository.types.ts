export interface RepositoryError {
    code: 'NOT_FOUND' | 'SAVE_FAILED' | 'LOAD_FAILED' | 'VALIDATION_ERROR' | 'NETWORK_ERROR';
    message: string;
    retryable: boolean;
}
