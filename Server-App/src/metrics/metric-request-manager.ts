import Axios from 'axios';

import { JobInfo } from '../model/job-info';
import { JobManagerMetrics } from '../model/metrics/job-manager-metrics';
import { MetricResponseBody } from '../model/metrics/metric-types';
import TaskManagerMetrics from '../model/metrics/task-manager-metrics';
import TaskMetrics from '../model/metrics/task-metrics';

export default class MetricRequestManager {
    public static getJobManagerMetrics(jobInfo: JobInfo): Promise<JobManagerMetrics> {
        return Axios.get(`${jobInfo.clientBaseUrl}/jobmanager/metrics${JobManagerMetrics.getQueryStringParams()}`).then(response => {
            return new JobManagerMetrics(response.data);
        });
    }

    public static async getTaskManagerMetrics(jobInfo: JobInfo, taskManagerIds: Array<string>): Promise<Array<MetricResponseBody>> {
        const taskManagerMetricPromises: Array<Promise<MetricResponseBody>> = taskManagerIds.map(taskManagerId => {
            return Axios.get(`${jobInfo.clientBaseUrl}/taskmanagers/${taskManagerId}/metrics${TaskManagerMetrics.getQueryStringParams()}`).then(
                response => {
                    return response.data;
                }
            );
        });

        return Promise.all(taskManagerMetricPromises);
    }

    public static async getSubTaskMetrics(jobInfo: JobInfo, vertexIds: Array<string>): Promise<Array<MetricResponseBody>> {
        const taskManagerMetricPromises: Array<Promise<MetricResponseBody>> = vertexIds.map(vertexId => {
            return Axios.get(
                `${jobInfo.clientBaseUrl}/jobs/${jobInfo.jobId}/vertices/${vertexId}/subtasks/metrics${TaskMetrics.getQueryStringParams()}`
            ).then(response => {
                return response.data;
            });
        });

        return Promise.all(taskManagerMetricPromises);
    }
}
