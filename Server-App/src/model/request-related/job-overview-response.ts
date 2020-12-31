export const enum ComponentExecutionStatus {
    'DEPLOYING' = 'DEPLOYING',
    'CANCELED' = 'CANCELED',
    'RUNNING' = 'RUNNING',
    'FINISHED' = 'FINISHED',
    'FAILED' = 'FAILED',
    'RECONCILING' = 'RECONCILING',
    'CANCELING' = 'CANCELING',
    'SCHEDULED' = 'SCHEDULED',
    'CREATED' = 'CREATED',
}

export interface JobVertices {
    id: string;
    status: ComponentExecutionStatus;
}

export interface JobOverviewResponseBody {
    state: ComponentExecutionStatus;
    duration: number;
    vertices: Array<JobVertices>;
}
