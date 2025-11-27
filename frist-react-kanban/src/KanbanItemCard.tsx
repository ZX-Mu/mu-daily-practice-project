import React, {useEffect, useState} from "react";
import type {TaskItem} from "./types";
import {ManageContext} from "./context/manage.ts";

// 时间格式化
const timeFormat = (date: string) => {
    const timeDiff = new Date().getTime() - new Date(date).getTime();
    const minuteDiff = Math.floor(timeDiff / (60 * 1000));
    const hourDiff = Math.floor(timeDiff / (3600 * 1000));
    const dayDiff = Math.floor(timeDiff / (24 * 3600 * 1000));
    const mouthDiff = Math.floor(timeDiff / (30 * 24 * 3600 * 1000));
    let result = "刚刚";
    if (mouthDiff > 0) {
        result = `${mouthDiff}月前`
    } else if (dayDiff > 0) {
        result = `${dayDiff}天前`
    } else if (hourDiff > 0) {
        result = `${hourDiff}小时前`
    } else if (minuteDiff > 0) {
        result = `${minuteDiff}分钟前`
    }

    return result
}

interface KanbanItemCardProps {
    task: TaskItem,
    delTask: (task: TaskItem) => void,
    setDraggedItem: (task: TaskItem | null) => void
}

//任务卡片
export const KanbanItemCard: React.FC<KanbanItemCardProps> = ({task, setDraggedItem, delTask}) => {
    const [displayTime, setDisplayTime] = useState(timeFormat(task.date));
    useEffect(() => {
        const timer = setInterval(() => {
            setDisplayTime(timeFormat(task.date));
        }, 1000 * 60);
        //返回清除函数，当task.date变化或组件卸载时，清除定时器
        return () => clearInterval(timer);
    }, [task.date]);

    //拖拽
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        console.log(`开始拖拽任务${task.name}`, e);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.name);
        setDraggedItem(task);
    }
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        console.log(`任务${task.name}拖拽结束`, e);
        e.dataTransfer.clearData();
    }

    //管理模式下，显示删除按钮(context)
    const {enabled} = React.useContext(ManageContext);

    return (
        <div key={task.name} className="kanban-item" draggable onDragStart={handleDragStart}
             onDragEnd={handleDragEnd}>
            <div className="kanban-item-title">
                <div className="kanban-item-name">{task.name}</div>
                {enabled && <div className="kanban-item-delete" onClick={() => delTask(task)}>删除</div>}
            </div>
            <div className="kanban-item-date">{displayTime}</div>
        </div>
    )
};