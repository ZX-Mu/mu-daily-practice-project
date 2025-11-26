import type {TaskItem, TaskType} from "./types";
import * as React from "react";
import {useEffect, useState} from "react";
import {KanbanColumn} from "./KanbanColumn.tsx";

const TASK_TYPE_VALUES: Record<string, TaskType> = {
    TODO: "todo",
    DOING: "doing",
    DONE: "done",
};
export const KanbanMain = ({todoTasks, doingTasks, doneTasks, setTodoTasks, setDoingTasks, setDoneTasks}: {
    todoTasks: TaskItem[],
    doingTasks: TaskItem[],
    doneTasks: TaskItem[],
    setTodoTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
    setDoingTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>,
    setDoneTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>
}) => {
    //拖拽记录
    const [draggedItem, setDraggedItem] = useState<TaskItem | null>(null);
    const [dragSource, setDragSource] = useState<TaskType | null>(null);
    const [dragTarget, setDragTarget] = useState<TaskType | null>(null);

    const updateMap: { [x: string]: React.Dispatch<React.SetStateAction<TaskItem[]>> } = {
        [TASK_TYPE_VALUES.TODO]: setTodoTasks,
        [TASK_TYPE_VALUES.DOING]: setDoingTasks,
        [TASK_TYPE_VALUES.DONE]: setDoneTasks,
    }
    //拖拽结束后操作数据移动
    useEffect(() => {
        if (!draggedItem || !dragSource || !dragTarget) {
            return;
        }
        if (dragSource === dragTarget) {
            console.log("拖拽目标与源相同，不处理");
            return;
        }
        console.log(`将任务${draggedItem.name}从“${dragSource}”移动到“${dragTarget}”,开始处理数据移动`)
        //知识点： 当使用函数形式调用 React 的 setState 时（如 setTodoTasks、setDoingTasks、setDoneTasks），React 会自动将当前的 state 值作为参数传递给回调函数。
        //源数据移除
        handleDelTask(dragSource, draggedItem);
        //目标数据添加
        handleAddTask(dragTarget, draggedItem)

        // 重置拖拽状态
        setDraggedItem(null);
        setDragSource(null);
        setDragTarget(null);
    }, [dragTarget, draggedItem, dragSource])


    const handleDelTask = (type: TaskType, task: TaskItem) => {
        updateMap[type]((tasks: TaskItem[]) => tasks.filter((item) => item.id !== task.id));
    };
    const handleAddTask = (type: TaskType, task: TaskItem) => {
        updateMap[type]((tasks: TaskItem[]) => [...tasks, task]);
    };

    return (
        <div className="app-main">
            <KanbanColumn title="待处理" list={todoTasks} type={TASK_TYPE_VALUES.TODO} setDragSource={setDragSource}
                          setDragTarget={setDragTarget} setDraggedItem={setDraggedItem}
                          className="kanban-todo" addTask={handleAddTask} delTask={handleDelTask}/>
            <KanbanColumn title="进行中" list={doingTasks} type={TASK_TYPE_VALUES.DOING} setDragSource={setDragSource}
                          setDragTarget={setDragTarget} setDraggedItem={setDraggedItem}
                          className="kanban-doing" addTask={handleAddTask} delTask={handleDelTask}/>
            <KanbanColumn title="已完成" list={doneTasks} type={TASK_TYPE_VALUES.DONE} setDragSource={setDragSource}
                          setDragTarget={setDragTarget} setDraggedItem={setDraggedItem}
                          className="kanban-done" addTask={handleAddTask} delTask={handleDelTask}/>
        </div>
    )
}