package pt.ist.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NewJobRequestBody {
    @JsonProperty("clientBaseUrl")
    public final String clientBaseUrl;
    @JsonProperty("jobName")
    public final String jobName;
    @JsonProperty("serviceLevelAgreement")
    public final ServiceLevelAgreement sla;
    @JsonProperty("jarName")
    public final String jarName;

    public NewJobRequestBody(String clientBaseUrl, String jobName, ServiceLevelAgreement sla, String jarName) {
        this.clientBaseUrl = clientBaseUrl;
        this.jobName = jobName;
        this.sla = sla;
        this.jarName = jarName;
    }
}
