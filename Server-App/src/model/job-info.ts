import ServiceLevelAgreement from './service-level-agreement';

export class JobInfo {
    constructor(
        public jobName: string,
        public jarName: string,
        public serviceLevelAgreement: ServiceLevelAgreement,
        public clientBaseUrl: string,
        public jobId?: string,
        public parallelismLevel?: number
    ) {}
}
