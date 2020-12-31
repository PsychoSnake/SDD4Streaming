import Axios from 'axios';

import { JobInfo } from './model/job-info';
import { JobOverviewResponseBody } from './model/request-related/job-overview-response';
import { TaskManagerListInfoResponseBody } from './model/request-related/task-manager-list-info-response';
import { TaskOverviewResponseBody } from './model/request-related/task-overview-response';

export class RequestManager {
    public static getJobOverview(jobInfo: JobInfo): Promise<JobOverviewResponseBody> {
        return Axios.get(`${jobInfo.clientBaseUrl}/jobs/${jobInfo.jobId}`).then(response => {
            return response.data;
        });
    }

    public static async updateJobInfo(jobInfo: JobInfo): Promise<JobInfo> {
        let jobId = jobInfo.jobId;
        let parallelismLevel = jobInfo.parallelismLevel;
        if (!jobId) {
            const response = await Axios.get(`${jobInfo.clientBaseUrl}/jobs/overview`);

            const jobList = response.data.jobs;

            const job = jobList.find((job: any) => job.name === jobInfo.jobName && job.state === 'RUNNING');

            jobId = job?.jid;
        }

        if (!parallelismLevel) {
            const response = await Axios.get(`${jobInfo.clientBaseUrl}/jobs/${jobId}/config`);

            const executionConfig = response.data['execution-config'];

            parallelismLevel = executionConfig['job-parallelism'];
        }

        const updatedJobInfo: JobInfo = { ...jobInfo, jobId, parallelismLevel };

        return updatedJobInfo;
    }

    public static getAllTaskManagerInfo(jobInfo: JobInfo): Promise<TaskManagerListInfoResponseBody> {
        return Axios.get(`${jobInfo.clientBaseUrl}/taskmanagers`).then(response => {
            return response.data;
        });
    }

    public static getTaskInfo(jobInfo: JobInfo, taskId: string): Promise<TaskOverviewResponseBody> {
        return Axios.get(`${jobInfo.clientBaseUrl}/jobs/${jobInfo.jobId}/vertices/${taskId}`).then(response => {
            return response.data;
        });
    }

    public static createSavepoint(jobInfo: JobInfo, shouldCancelJob: boolean): Promise<string> {
        return Axios.post(`${jobInfo.clientBaseUrl}/jobs/${jobInfo.jobId}/savepoints`, { 'cancel-job': shouldCancelJob }).then(response => {
            return response.data['request-id'];
        });
    }

    public static getSavepointOperationState(jobInfo: JobInfo, triggerId: string): Promise<any> {
        return new Promise(resolve => {
            this.loopUntilSavepointOperationFinishes(jobInfo, triggerId, resolve);
        });
    }

    public static getJar(jobInfo: JobInfo): Promise<any> {
        return Axios.get(`${jobInfo.clientBaseUrl}/jars`).then(response => {
            const jarList = response.data.files;

            return jarList.find((jar: any) => jar.name === jobInfo.jarName);
        });
    }

    public static startJobFromJar(jobInfo: JobInfo, jarId: string, savepointLocation: string, newParallelismLevel: number): Promise<any> {
        return Axios.post(`${jobInfo.clientBaseUrl}/jars/${jarId}/run?savepointPath=${savepointLocation}&parallelism=${newParallelismLevel}`);
    }

    private static loopUntilSavepointOperationFinishes(jobInfo: JobInfo, triggerId: string, resolve: (value: any | PromiseLike<any>) => void): void {
        Axios.get(`${jobInfo.clientBaseUrl}/jobs/${jobInfo.jobId}/savepoints/${triggerId}`).then(response => {
            if (response.data.status.id === 'COMPLETED') {
                resolve(response.data);
            } else {
                setTimeout(() => this.loopUntilSavepointOperationFinishes(jobInfo, triggerId, resolve), 1000);
            }
        });
    }
}
