package pt.ist;

import org.apache.flink.api.common.functions.FilterFunction;
import org.apache.flink.api.common.functions.FlatMapFunction;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.functions.ReduceFunction;
import org.apache.flink.streaming.api.functions.windowing.AllWindowFunction;
import org.apache.flink.streaming.api.functions.windowing.WindowFunction;
import org.apache.flink.streaming.api.windowing.windows.Window;
import pt.ist.middleware.*;

public class OperatorCreator {
    private final FlinkRestApiHandler flinkClient;

    public OperatorCreator(FlinkRestApiHandler flinkClient) {
        this.flinkClient = flinkClient;
    }

    public <T,U> FlatMapFunction<T,U> createFlatMapOperator(FlatMapFunction<T,U> clientOperator) {
        return new SddFlatMapFunction<T, U>(this.flinkClient, clientOperator);
    }

    public <T,U> MapFunction<T,U> createMapOperator(MapFunction<T,U> clientOperator) {
        return new SddMapFunction<T, U>(this.flinkClient, clientOperator);
    }

    public <T> ReduceFunction<T> createReduceOperator(ReduceFunction<T> clientOperator) {
        return new SddReduceFunction<T>(this.flinkClient, clientOperator);
    }

    public <T> FilterFunction<T> createFilterOperator(FilterFunction<T> clientOperator) {
        return new SddFilterFunction<T>(this.flinkClient, clientOperator);
    }

    public <T,U,V> WindowFunction<T, U, V, Window> createWindowApplyOperator(WindowFunction<T, U, V, Window> clientOperator) {
        return new SddWindowApplyFunction<T, U, V>(this.flinkClient, clientOperator);
    }

    public <T,U> AllWindowFunction<T, U, Window> createWindowAllApplyOperator(AllWindowFunction<T, U, Window> clientOperator) {
        return new SddAllWindowApplyFunction<T, U>(this.flinkClient, clientOperator);
    }
}
