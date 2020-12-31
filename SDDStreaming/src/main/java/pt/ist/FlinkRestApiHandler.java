package pt.ist;

import pt.ist.model.FlinkRestClient;
import pt.ist.model.NewJobRequestBody;
import pt.ist.model.OperationResponseBody;
import pt.ist.model.ServiceLevelAgreement;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;

import java.io.IOException;
import java.io.Serializable;
import java.util.concurrent.CompletableFuture;

public class FlinkRestApiHandler implements Serializable {
    private final String jobName;
    private final String serverBaseUrl;
    private FlinkRestClient flinkClient;

    public FlinkRestApiHandler(String jobName, String serverBaseUrl) {
        this.jobName = jobName;
        this.serverBaseUrl = serverBaseUrl;
    }

    public void start(String clientBaseUrl, ServiceLevelAgreement sla, String jarName) throws IOException {
        FlinkRestClient flinkClient = this.createFlinkClient();

        Call<Void> call = flinkClient.notifyNewJob(new NewJobRequestBody(clientBaseUrl, this.jobName, sla, jarName));

        call.execute();
    }

    public boolean shouldProcessInput() {
        if (this.flinkClient == null) {
            this.flinkClient = this.createFlinkClient();
        }

        CompletableFuture<OperationResponseBody> response = this.flinkClient.shouldProcessInput(this.jobName);

        OperationResponseBody responseBody = null;
        try {
            responseBody = response.get();
        } catch (Exception e) {
            return true;
        }

        return responseBody.shouldProcessInput;
    }

    private FlinkRestClient createFlinkClient() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(this.serverBaseUrl)
                .addConverterFactory(JacksonConverterFactory.create())
                .build();

        return retrofit.create(FlinkRestClient.class);
    }
}
