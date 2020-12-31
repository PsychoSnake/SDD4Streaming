import { JobInfo } from './model/job-info';
import { RequestManager } from './request-manager';

export default class SddStreaming {
    private static jobMap = new Map<string, JobInfo>();
    private static jobsGettingUpdated: Array<string> = [];

    public static getAllKnownJobs(): Array<JobInfo> {
        return [...this.jobMap.values()];
    }

    public static async getJobInfo(jobName: string): Promise<JobInfo | undefined> {
        let jobInfo = this.jobMap.get(jobName);
        if (!jobInfo) {
            return undefined;
        }

        if (!jobInfo?.jobId && !this.jobsGettingUpdated.includes(jobName)) {
            this.jobsGettingUpdated.push(jobName);
            const updatedJobInfo = await this.updateJobInfo(jobInfo);
            this.jobMap.set(jobName, updatedJobInfo);
            this.jobsGettingUpdated.splice(
                this.jobsGettingUpdated.findIndex(elem => elem === jobName),
                1
            );

            return updatedJobInfo;
        }

        return jobInfo;
    }

    public static setJobInfo(jobName: string, jobInfo: JobInfo): void {
        this.jobMap.set(jobName, jobInfo);
    }

    public static removeJobInfo(jobName: string): void {
        this.jobMap.delete(jobName);
    }

    private static async updateJobInfo(currentJobInfo: JobInfo): Promise<JobInfo> {
        if (currentJobInfo?.jobId || currentJobInfo?.parallelismLevel) {
            return currentJobInfo;
        } else {
            const updatedJobInfo = await RequestManager.updateJobInfo(currentJobInfo);

            return updatedJobInfo;
        }
    }
}
