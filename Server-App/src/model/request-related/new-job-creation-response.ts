import ServiceLevelAgreement from '../service-level-agreement';

export default interface NewJobRequestBody {
    serviceLevelAgreement: ServiceLevelAgreement;
    jobName: string;
    clientBaseUrl: string;
    jarName: string;
}
