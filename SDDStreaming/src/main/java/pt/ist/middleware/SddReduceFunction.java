package pt.ist.middleware;

import org.apache.flink.api.common.functions.ReduceFunction;
import pt.ist.FlinkRestApiHandler;

public class SddReduceFunction<T> implements ReduceFunction<T> {
    private final FlinkRestApiHandler flinkClient;
    private final ReduceFunction<T> clientFunction;

    public SddReduceFunction(FlinkRestApiHandler flinkClient, ReduceFunction<T> clientFunction) {
        this.flinkClient = flinkClient;
        this.clientFunction = clientFunction;
    }

    @Override
    public T reduce(T value1, T value2) throws Exception {
        this.flinkClient.shouldProcessInput();

        return this.clientFunction.reduce(value1, value2);
    }
}
