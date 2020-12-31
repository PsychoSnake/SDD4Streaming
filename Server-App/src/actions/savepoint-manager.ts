import { JobInfo } from '../model/job-info';
import { RequestManager } from '../request-manager';

export default class SavepointManager {
    public static async rescaleJob(jobInfo: JobInfo, newParallelismLevel: number): Promise<boolean> {
        if (!jobInfo || !jobInfo.jobId || !jobInfo.jarName) {
            return false;
        }

        const triggerId = await RequestManager.createSavepoint(jobInfo, true);
        const savepointStateResponse = await RequestManager.getSavepointOperationState(jobInfo, triggerId);

        if (savepointStateResponse.status.id !== 'COMPLETED' || !savepointStateResponse.operation.location) {
            return false;
        }

        const savepointLocation = savepointStateResponse.operation.location;

        const jobJar = await RequestManager.getJar(jobInfo);

        if (!jobJar) {
            return false;
        }

        await RequestManager.startJobFromJar(jobInfo, jobJar.id, savepointLocation, newParallelismLevel);

        return true;
    }
}
