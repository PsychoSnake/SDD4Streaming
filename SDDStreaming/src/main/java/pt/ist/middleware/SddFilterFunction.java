package pt.ist.middleware;

import org.apache.flink.api.common.functions.FilterFunction;
import pt.ist.FlinkRestApiHandler;

public class SddFilterFunction<T> implements FilterFunction<T> {
    private final FlinkRestApiHandler flinkClient;
    private final FilterFunction<T> clientFunction;

    public SddFilterFunction(FlinkRestApiHandler flinkClient, FilterFunction<T> clientFunction) {
        this.flinkClient = flinkClient;
        this.clientFunction = clientFunction;
    }

    @Override
    public boolean filter(T value) throws Exception {
        this.flinkClient.shouldProcessInput();

        return this.clientFunction.filter(value);
    }
}
