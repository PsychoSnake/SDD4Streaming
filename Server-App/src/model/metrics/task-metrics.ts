import { MetricResponseBody, TaskMetricIds } from './metric-types';

export default class TaskMetrics {
    public inPoolUsage: number;
    public outPoolUsage: number;

    private static queryStringParams = [TaskMetricIds['buffers.inPoolUsage'], TaskMetricIds['buffers.outPoolUsage']];

    constructor(taskMetrics: MetricResponseBody) {
        this.inPoolUsage = taskMetrics.find(elem => elem.id === TaskMetricIds['buffers.inPoolUsage'])?.avg || 0;
        this.outPoolUsage = taskMetrics.find(elem => elem.id === TaskMetricIds['buffers.outPoolUsage'])?.avg || 0;
    }

    public static getQueryStringParams(): string {
        return `?get=${this.queryStringParams.join(',')}`;
    }
}
