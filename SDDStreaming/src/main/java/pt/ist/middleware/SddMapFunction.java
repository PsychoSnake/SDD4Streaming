package pt.ist.middleware;

import org.apache.flink.api.common.functions.MapFunction;
import pt.ist.FlinkRestApiHandler;

public class SddMapFunction<T, U> implements MapFunction<T, U> {
    private final FlinkRestApiHandler flinkClient;
    private final MapFunction<T, U> clientFunction;

    public SddMapFunction(FlinkRestApiHandler flinkClient, MapFunction<T, U> clientFunction) {
        this.flinkClient = flinkClient;
        this.clientFunction = clientFunction;
    }

    @Override
    public U map(T value) throws Exception {
        this.flinkClient.shouldProcessInput();

        return this.clientFunction.map(value);
    }
}
