package pt.ist.middleware;

import org.apache.flink.streaming.api.functions.windowing.WindowFunction;
import org.apache.flink.streaming.api.windowing.windows.Window;
import org.apache.flink.util.Collector;
import pt.ist.FlinkRestApiHandler;

public class SddWindowApplyFunction<T, U, V> implements WindowFunction<T, U, V, Window> {
    private final FlinkRestApiHandler flinkClient;
    private final WindowFunction<T, U, V, Window> clientFunction;

    public SddWindowApplyFunction(FlinkRestApiHandler flinkClient, WindowFunction<T, U, V, Window> clientFunction) {
        this.flinkClient = flinkClient;
        this.clientFunction = clientFunction;
    }

    @Override
    public void apply(V v, Window window, Iterable<T> input, Collector<U> out) throws Exception {
        boolean shouldProcessInput = this.flinkClient.shouldProcessInput();

        if (shouldProcessInput) {
            this.clientFunction.apply(v, window, input, out);
        }
    }
}
