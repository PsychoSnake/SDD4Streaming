export default class ServiceLevelAgreement {
    constructor(readonly maxNumberOfTaskSlots: number, readonly resourceUsage: number, readonly inputCoverage: number) {}
}
