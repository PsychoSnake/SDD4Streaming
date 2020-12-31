package pt.ist.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OperationResponseBody {
    public boolean shouldProcessInput;

    public OperationResponseBody(@JsonProperty("shouldProcessInput") boolean shouldProcessInput) {
        this.shouldProcessInput = shouldProcessInput;
    }
}
