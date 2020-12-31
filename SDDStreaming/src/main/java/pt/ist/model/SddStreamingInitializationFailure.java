package pt.ist.model;

public class SddStreamingInitializationFailure extends Exception {
    private String failureReason;

    public SddStreamingInitializationFailure(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getFailureReason() {
        return failureReason;
    }

}
