import type {TaskItem, TaskType} from "./types";
import {KanbanAddCard} from "./KanbanAddCard.tsx";
import {KanbanItemCard} from "./KanbanItemCard.tsx";
import * as React from "react";
import {useState} from "react";

interface KanbanColumnProps {
    title: string,
    type: TaskType,
    list: TaskItem[], //任务列表
    className: string, //列的样式
    addTask: (type: TaskType, task: TaskItem) => void, //添加任务
    delTask: (type: TaskType, task: TaskItem) => void, //删除任务
    setDraggedItem: (item: TaskItem | null) => void, //拖拽的任务
    setDragSource: (source: TaskType | null) => void, //拖拽的源
    setDragTarget: (target: TaskType | null) => void, //拖拽的目标
}

//看板列
export const KanbanColumn: React.FC<KanbanColumnProps> = ({title, list, addTask, delTask, className, setDragSource, setDragTarget, setDraggedItem, type}) => {
    //添加按钮
    const [showAdd, setShowAdd] = useState(false);
    const handleAddTask = (task: TaskItem) => {
        addTask(type, task);
        setShowAdd(false);
    }
    //删除
    const handleDelTask = (task: TaskItem) => {
        delTask(type, task);
    }

    //拖拽
    const handleDragStart = () => {
        console.log(`开始从“${title}”拖拽任务`);
        //记录拖拽开始的列
        setDragSource(type)
        //如果之前有拖拽目标，清除
        setDragTarget(null)
    }
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

    }
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const taskName = e.dataTransfer.getData("text/plain");
        console.log(`将任务（${taskName}）拖拽到了“${title}”`);
        setDragTarget(type)
    }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'none';
        console.log(`离开了区域“${title}”`);
    }
    const handleDragEnd = () => {
        console.log(`拖拽任务在“${title}”结束`);
    }

    return (
        <div className={`app-main-kanban ${className}`} onDragStart={handleDragStart} onDragOver={handleDragOver}
             onDrop={handleDrop} onDragLeave={handleDragLeave} onDragEnd={handleDragEnd}>
            <div className="kanban-title">
                <span>{title}</span>
                <button
                    className="kanban-add-btn"
                    onClick={() => setShowAdd(true)}
                >
                    添加任务
                </button>
            </div>
            <div className="kanban-item-list">
                {showAdd && <KanbanAddCard onAdd={handleAddTask}/>}
                {list.map((task) => (
                    <KanbanItemCard key={task.id} task={task} setDraggedItem={setDraggedItem} delTask={handleDelTask}/>
                ))}
            </div>
        </div>)
}