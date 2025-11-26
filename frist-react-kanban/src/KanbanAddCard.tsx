import type {TaskItem} from "./types";
import {useEffect, useRef, useState} from "react";

export const KanbanAddCard = ({onAdd}: { onAdd: (task: TaskItem) => void }) => {
    const [name, setName] = useState("");
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.currentTarget.value);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            console.log("添加任务:", e.currentTarget.value);
            onAdd({
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                name: name,
                date: new Date().toLocaleString()
            });
        }
    };

    //可变的ref
    const inputRef = useRef<HTMLInputElement>(null);
    //组件挂载阶段 []
    useEffect(() => {
        //输入框自动聚焦
        inputRef.current?.focus();
    }, []);
    return (
        <div className="kanban-item">
            <input
                type="text"
                value={name}
                className="kanban-item-input"
                placeholder="输入任务名称"
                ref={inputRef}
                onChange={handleOnChange}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};