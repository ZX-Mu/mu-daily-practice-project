export type TaskType = "todo" | "doing" | "done";

export interface TaskItem {
    id: string;
    name: string;
    date: string;
}