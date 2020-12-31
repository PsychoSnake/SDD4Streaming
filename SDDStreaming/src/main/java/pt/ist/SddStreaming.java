package pt.ist;

import pt.ist.model.SddStreamingInitializationFailure;
import pt.ist.model.ServiceLevelAgreement;

public class SddStreaming {
    OperatorCreator operatorCreator;

    public SddStreaming(ServiceLevelAgreement sla, String serverBaseUrl, String clientBaseUrl, String jobName, String jarName) throws SddStreamingInitializationFailure {
        if (sla == null || serverBaseUrl == null || clientBaseUrl == null || jobName == null || jarName == null) {
            throw new SddStreamingInitializationFailure("Invalid Initialization data passed. Please check if every parameter is being passed.");
        }

        FlinkRestApiHandler flinkClient = null;
        try {
            flinkClient = new FlinkRestApiHandler(jobName, serverBaseUrl);
            flinkClient.start(clientBaseUrl, sla, jarName);
        } catch(Exception e) {
            throw new SddStreamingInitializationFailure("Failed to communicate with server. Please check if the server is running and the provided URL are correct");
        }
        this.operatorCreator = new OperatorCreator(flinkClient);
    }

    public OperatorCreator getOperatorCreator() {
        return this.operatorCreator;
    }
}
