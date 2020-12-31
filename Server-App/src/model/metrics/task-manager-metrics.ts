import { MetricResponseBody, TaskManagerMetricIds } from './metric-types';
import TaskMetrics from './task-metrics';

export default class TaskManagerMetrics {
    public cpuLoad?: number;
    public jobDuration: number;
    public taskMetrics: Array<TaskMetrics>;
    public hasAnyTaskFinishedAlready: boolean;

    private static queryStringParams = [TaskManagerMetricIds['Status.JVM.CPU.Load']];

    constructor(
        allTaskManagerMetrics: Array<MetricResponseBody>,
        amountOfSubTasksPerTaskManager: Array<number>,
        totalNumberOfSubTasks: number,
        hasAnyTaskFinishedAlready: boolean,
        jobDuration: number
    ) {
        this.hasAnyTaskFinishedAlready = hasAnyTaskFinishedAlready;
        this.jobDuration = jobDuration;
        this.taskMetrics = [];

        const avgCpuLoad = allTaskManagerMetrics.reduce(
            (acc, metric, index) =>
                acc +
                metric.find(elem => elem.id === TaskManagerMetricIds['Status.JVM.CPU.Load'])?.value *
                    (amountOfSubTasksPerTaskManager[index] / totalNumberOfSubTasks),
            0
        );

        this.cpuLoad = avgCpuLoad;
    }

    public static getQueryStringParams(): string {
        return `?get=${this.queryStringParams.join(',')}`;
    }
}
