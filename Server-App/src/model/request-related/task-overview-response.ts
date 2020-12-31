export interface SubTaskOverview {
    subtask: number;
    host: string;
}

export interface TaskOverviewResponseBody {
    id: string;
    subtasks: Array<SubTaskOverview>;
}
