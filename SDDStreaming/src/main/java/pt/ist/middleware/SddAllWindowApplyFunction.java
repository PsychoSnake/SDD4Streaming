package pt.ist.middleware;

import org.apache.flink.streaming.api.functions.windowing.AllWindowFunction;
import org.apache.flink.streaming.api.windowing.windows.Window;
import org.apache.flink.util.Collector;
import pt.ist.FlinkRestApiHandler;

public class SddAllWindowApplyFunction<T, U> implements AllWindowFunction<T, U, Window> {
    private final FlinkRestApiHandler flinkClient;
    private final AllWindowFunction<T, U, Window> clientFunction;

    public SddAllWindowApplyFunction(FlinkRestApiHandler flinkClient, AllWindowFunction<T, U, Window> clientFunction) {
        this.flinkClient = flinkClient;
        this.clientFunction = clientFunction;
    }

    @Override
    public void apply(Window window, Iterable<T> values, Collector<U> out) throws Exception {
        boolean shouldProcessInput = this.flinkClient.shouldProcessInput();

        if (shouldProcessInput) {
            this.clientFunction.apply(window, values, out);
        }
    }
}
