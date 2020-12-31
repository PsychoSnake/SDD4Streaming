import { JobInfo } from '../model/job-info';
import { JobManagerMetrics } from '../model/metrics/job-manager-metrics';
import TaskManagerMetrics from '../model/metrics/task-manager-metrics';
import TaskMetrics from '../model/metrics/task-metrics';
import { ComponentExecutionStatus } from '../model/request-related/job-overview-response';
import { TaskManagerListInfoResponseBody } from '../model/request-related/task-manager-list-info-response';
import { RequestManager } from '../request-manager';
import SddStreaming from '../sdd-streaming';

import MetricRequestManager from './metric-request-manager';

export class MetricManager {
    private static jobMetrics = new Map<string, JobManagerMetrics>(); // This will have the metrics for each specific job that we are monitoring

    public static getJobMetrics(jobName: string) {
        return this.jobMetrics.get(jobName);
    }

    public static startMetricMechanism() {
        setTimeout(this.fetchMetrics, 4000);
    }

    private static fetchMetrics = () => {
        const currentKnownJobs = SddStreaming.getAllKnownJobs();
        const allMetricRequestPromises: Array<Promise<void>> = [];

        allMetricRequestPromises.push(...currentKnownJobs.map(MetricManager.fetchJobMetrics));

        Promise.all(allMetricRequestPromises).then(() => setTimeout(MetricManager.fetchMetrics, 8000));
    };

    private static fetchJobMetrics = async (jobInfo: JobInfo): Promise<void> => {
        if (!jobInfo || !jobInfo.jobId) {
            return Promise.resolve();
        }
        const metricFetchPromises: Array<Promise<any>> = [];

        metricFetchPromises.push(MetricRequestManager.getJobManagerMetrics(jobInfo));
        metricFetchPromises.push(MetricManager.getTaskRelatedMetrics(jobInfo));

        const results = await Promise.all(metricFetchPromises);

        if (results[1] === null) {
            return;
        }

        const jobMetrics: JobManagerMetrics = { ...results[0], taskManagerMetrics: results[1] };

        MetricManager.jobMetrics.set(jobInfo.jobName, jobMetrics);
    };

    private static getTaskRelatedMetrics = async (jobInfo: JobInfo): Promise<TaskManagerMetrics | null> => {
        const jobOverview = await RequestManager.getJobOverview(jobInfo);
        if (jobOverview.state !== ComponentExecutionStatus.RUNNING) {
            SddStreaming.removeJobInfo(jobInfo.jobName);
            return null;
        }
        const taskManagerListInfo = await RequestManager.getAllTaskManagerInfo(jobInfo);

        const usedTaskManagers: { [key in string]: number } = {};
        let totalAmountOfSubtasks = 0;
        const runningTaskIds: Array<string> = [];

        const runningTaskPromises = jobOverview.vertices
            .filter(vertex => {
                return vertex.status === ComponentExecutionStatus.RUNNING;
            })
            .map(vertex => RequestManager.getTaskInfo(jobInfo, vertex.id));

        const runningTasks = await Promise.all(runningTaskPromises);

        runningTasks.forEach(taskInfo => {
            runningTaskIds.push(taskInfo.id);

            taskInfo.subtasks.forEach(subTask => {
                const currentAmount = usedTaskManagers[subTask.host] || 0;
                usedTaskManagers[subTask.host] = currentAmount + 1;

                totalAmountOfSubtasks += 1;
            });
        });

        const jobDurationInSeconds = jobOverview.duration / 1000;

        const taskManagerMetrics = await MetricManager.fetchTaskManagerRelatedMetrics(
            jobInfo,
            taskManagerListInfo,
            usedTaskManagers,
            totalAmountOfSubtasks,
            runningTasks.length !== jobOverview.vertices.length,
            jobDurationInSeconds
        );

        const taskMetrics = await MetricManager.fetchTaskRelatedMetrics(jobInfo, runningTaskIds);

        taskManagerMetrics.taskMetrics = taskMetrics;

        return taskManagerMetrics;
    };

    private static async fetchTaskManagerRelatedMetrics(
        jobInfo: JobInfo,
        allTaskManagerInfo: TaskManagerListInfoResponseBody,
        usedTaskManagers: { [key in string]: number },
        totalAmountOfSubtasks: number,
        hasAnyTaskFinishedAlready: boolean,
        jobDuration: number
    ) {
        const taskManagerIds: Array<string> = [];

        Object.keys(usedTaskManagers).forEach(hostName => {
            const port = Number(hostName.split(':')[1]);
            const taskManager = allTaskManagerInfo.taskmanagers.find(taskManager => taskManager.dataPort === port);

            if (taskManager) {
                taskManagerIds.push(taskManager.id);
            }
        });

        const allTaskManagerMetrics = await MetricRequestManager.getTaskManagerMetrics(jobInfo, taskManagerIds);

        return new TaskManagerMetrics(
            allTaskManagerMetrics,
            Object.values(usedTaskManagers),
            totalAmountOfSubtasks,
            hasAnyTaskFinishedAlready,
            jobDuration
        );
    }

    private static async fetchTaskRelatedMetrics(jobInfo: JobInfo, runningTaskIds: Array<string>) {
        const allTaskMetrics = await MetricRequestManager.getSubTaskMetrics(jobInfo, runningTaskIds);

        return allTaskMetrics.map(metrics => new TaskMetrics(metrics));
    }
}
