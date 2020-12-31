export interface TaskManagerInfo {
    id: string;
    dataPort: number;
}

export interface TaskManagerListInfoResponseBody {
    taskmanagers: Array<TaskManagerInfo>;
}
