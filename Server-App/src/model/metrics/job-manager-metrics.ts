import TaskManagerMetrics from './task-manager-metrics';

export class JobManagerMetrics {
    private static requestNameMapper: any = {
        taskSlotsAvailable: 'availableTaskSlots',
        taskSlotsTotal: 'totalTaskSlots',
    };
    public availableTaskSlots = 0;
    public taskManagerMetrics?: TaskManagerMetrics;

    constructor(requestBody: any) {
        requestBody.forEach((elem: any) => {
            const propertyName: string = JobManagerMetrics.requestNameMapper[elem.id];
            if (propertyName) {
                (this as any)[propertyName] = elem.value;
            }
        });
    }

    public static getQueryStringParams(): string {
        const parameterNames = Object.keys(JobManagerMetrics.requestNameMapper);
        return `?get=${parameterNames.join(',')}`;
    }
}
