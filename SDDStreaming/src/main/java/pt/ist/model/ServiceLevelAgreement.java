package pt.ist.model;


public class ServiceLevelAgreement {
    public Integer maxNumberOfTaskSlots;
    public double resourceUsage;
    public double inputCoverage;

    /**
     * @param maxNumberOfTaskSlots Maximum amount of task slots that is allowed the job to use
     * @param resourceUsage Maximum resource usage allowed in the system
     * @param inputCoverage Minimum amount of inputs that should be processed
     */
    public ServiceLevelAgreement(Integer maxNumberOfTaskSlots, double resourceUsage, double inputCoverage) {
        this.maxNumberOfTaskSlots = maxNumberOfTaskSlots;
        this.resourceUsage = resourceUsage;
        this.inputCoverage = inputCoverage;
    }
}
