package pt.ist.model;

import retrofit2.Call;
import retrofit2.http.*;

import java.util.concurrent.CompletableFuture;

public interface FlinkRestClient {
    @POST("/new-job")
    @Headers({"accept: application/json", "content-type: application/json"})
    Call<Void> notifyNewJob(@Body NewJobRequestBody requestBody);

    @GET("/should-process/{jobname}")
    @Headers({"accept: application/json"})
    CompletableFuture<OperationResponseBody> shouldProcessInput(@Path("jobname") String jobName);
}
