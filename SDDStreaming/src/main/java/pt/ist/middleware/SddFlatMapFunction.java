package pt.ist.middleware;

import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.util.Collector;
import pt.ist.FlinkRestApiHandler;

public class SddFlatMapFunction<T, U> implements FlatMapFunction<T, U> {
    private final FlinkRestApiHandler flinkClient;
    private final FlatMapFunction<T, U> clientFunction;

    public SddFlatMapFunction(FlinkRestApiHandler flinkClient, FlatMapFunction<T, U> clientFunction) {
        this.flinkClient = flinkClient;
        this.clientFunction = clientFunction;
    }

    @Override
    public void flatMap(T value, Collector<U> out) throws Exception {
        boolean shouldProcessInput = this.flinkClient.shouldProcessInput();

        if (shouldProcessInput) {
            this.clientFunction.flatMap(value, out);
        }
    }
}
