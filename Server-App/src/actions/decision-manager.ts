import { MetricManager } from '../metrics/metric-manager';
import { JobInfo } from '../model/job-info';
import { JobManagerMetrics } from '../model/metrics/job-manager-metrics';
import SddStreaming from '../sdd-streaming';

import SavepointManager from './savepoint-manager';

export default class DecisionManager {
    private static jobOperationCounter = new Map<string, Array<number>>();
    private static jobsGettingRescaled: Array<string> = [];

    public static async shouldProcessInput(jobName: string): Promise<boolean> {
        if (this.jobsGettingRescaled.includes(jobName)) {
            return true;
        }

        const currentJobCounter = this.jobOperationCounter.get(jobName) || [0, 0];
        this.jobOperationCounter.set(jobName, [currentJobCounter[0] + 1, currentJobCounter[1]]);

        const jobInfo = await SddStreaming.getJobInfo(jobName);
        const jobMetrics = MetricManager.getJobMetrics(jobName);
        if (!jobInfo || !jobMetrics) {
            return true;
        }

        if (jobMetrics.taskManagerMetrics && jobMetrics.taskManagerMetrics.jobDuration > 20) {
            if (!jobMetrics.taskManagerMetrics?.hasAnyTaskFinishedAlready) {
                const wasTheJobRescaled = await this.rescaleJobIfPossible(jobInfo, jobMetrics);
                if (wasTheJobRescaled) {
                    return true;
                }
            }

            const currentInputCoverage = 1 - currentJobCounter[1] / currentJobCounter[0];

            if (this.isJobDegraded(jobInfo, jobMetrics) && currentInputCoverage > jobInfo.serviceLevelAgreement.inputCoverage) {
                this.jobOperationCounter.set(jobName, [currentJobCounter[0], currentJobCounter[1] + 1]);
                return false;
            }
        }

        return true;
    }

    private static isJobDegraded(jobInfo: JobInfo, jobMetrics: JobManagerMetrics) {
        const cpuLoad = jobMetrics.taskManagerMetrics?.cpuLoad || 0;

        const taskMetrics = jobMetrics.taskManagerMetrics?.taskMetrics.filter(metrics => metrics?.inPoolUsage > 0 || metrics?.outPoolUsage > 0) || [];
        const inPoolUsage = taskMetrics?.reduce((acc, value) => acc + value.inPoolUsage, 0) / taskMetrics?.length;
        const outPoolUsage = taskMetrics?.reduce((acc, value) => acc + value.outPoolUsage, 0) / taskMetrics?.length;
        let areTasksOverloaded = (inPoolUsage === 0 && outPoolUsage >= 0.5) || outPoolUsage >= 0.75;

        return cpuLoad > jobInfo.serviceLevelAgreement?.resourceUsage || areTasksOverloaded;
    }

    private static async rescaleJobIfPossible(jobInfo: JobInfo, jobMetrics: JobManagerMetrics): Promise<boolean> {
        const { serviceLevelAgreement, parallelismLevel = 0 } = jobInfo;
        const cpuLoad = jobMetrics.taskManagerMetrics?.cpuLoad || 0;
        const availableTaskSlots = jobMetrics.availableTaskSlots || 0;
        const maxNumberOfTaskSlots = serviceLevelAgreement.maxNumberOfTaskSlots === null ? Infinity : serviceLevelAgreement.maxNumberOfTaskSlots;

        if (this.isJobDegraded(jobInfo, jobMetrics) && parallelismLevel < maxNumberOfTaskSlots && availableTaskSlots > 1) {
            console.log('RESCALING UP NOW!!!', jobMetrics.taskManagerMetrics?.cpuLoad);
            const wasRescalingSuccessful = await this.rescaleJob(jobInfo, parallelismLevel + 1);

            return wasRescalingSuccessful;
        }

        if (cpuLoad < 0.3 && parallelismLevel > 1) {
            console.log('RESCALING DOWN NOW!!!', jobMetrics.taskManagerMetrics?.cpuLoad);
            const wasRescalingSuccessful = await this.rescaleJob(jobInfo, parallelismLevel - 1);

            return wasRescalingSuccessful;
        }

        return false;
    }

    private static async rescaleJob(jobInfo: JobInfo, newParallelismLevel: number) {
        this.jobsGettingRescaled.push(jobInfo.jobName);
        const wasSavepointSuccessful = await SavepointManager.rescaleJob(jobInfo, newParallelismLevel);
        if (!wasSavepointSuccessful) {
            console.log('FAILED_RESCALING');
        } else {
            console.log('SUCCESSFUL_RESCALING');
        }
        this.jobsGettingRescaled.splice(this.jobsGettingRescaled.findIndex(elem => elem === jobInfo.jobName) - 1, 1);
        return wasSavepointSuccessful;
    }
}
