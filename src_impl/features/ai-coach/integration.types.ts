export interface IntegrationHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
        serviceAvailable: boolean;
        repositoryConnected: boolean;
        eventBusConnected: boolean;
        };
    lastChecked: number;
}
