import "./App.css";
import {useEffect, useRef, useState} from "react";
import type {TaskType} from "./types";

const TASK_TYPE_VALUES: Record<string, TaskType> = {
    TODO: "todo",
    DOING: "doing",
    DONE: "done",
};
interface TaskItem {
    name: string;
    date: string;
}

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

const STORAGE_KEY = "kanban-data"

const RenderKanbanColumn = ({
                                title,
                                addTask,
                                className,
                                children,
                                setDragSource,
                                setDragTarget,
                                type,
                            }: {
    title: string,
    type: TaskType,
    className: string,
    addTask: () => void,
    children: React.ReactNode,
    setDragSource: (source: TaskType | null) => void
    setDragTarget: (target: TaskType | null) => void
}) => {
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
                    onClick={addTask}
                >
                    添加任务
                </button>
            </div>
            <div className="kanban-item-list">
                {children}
            </div>
        </div>)
}

const RenderKanbanItemList = ({task, setDraggedItem}: {
    task: TaskItem,
    setDraggedItem: (task: TaskItem | null) => void
}) => {
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
    return (
        <div key={task.name} className="kanban-item" draggable onDragStart={handleDragStart}
             onDragEnd={handleDragEnd}>
            <div className="kanban-item-name">{task.name}</div>
            <div className="kanban-item-date">{displayTime}</div>
        </div>
    )
};

function App() {
    const [todoTasks, setTodoTasks] = useState<TaskItem[]>([]);
    const [doingTasks, setDoingTasks] = useState<TaskItem[]>([]);
    const [doneTasks, setDoneTasks] = useState<TaskItem[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    //组件挂载时，模拟异步获取数据
    useEffect(() => {
        setIsLoading(true);
        const data = window.localStorage.getItem(STORAGE_KEY);
        setTimeout(() => {
            if (data) {
                console.log("从本地获取数据:", data);
                const {todoTasks, doingTasks, doneTasks} = JSON.parse(data);
                setTodoTasks(todoTasks);
                setDoingTasks(doingTasks);
                setDoneTasks(doneTasks);
                setIsLoading(false);
            }
        }, 1000)
    }, []);

    //拖拽记录
    const [draggedItem, setDraggedItem] = useState<TaskItem | null>(null);
    const [dragSource, setDragSource] = useState<TaskType | null>(null);
    const [dragTarget, setDragTarget] = useState<TaskType | null>(null);
    //拖拽结束后操作数据移动
    useEffect(() => {
        if (!draggedItem || !dragSource || !dragTarget) {
            return;
        }
        if (dragSource === dragTarget) {
            console.log("拖拽目标与源相同，不处理");
            return;
        }
        const updateMap = {
            [TASK_TYPE_VALUES.TODO]: setTodoTasks,
            [TASK_TYPE_VALUES.DOING]: setDoingTasks,
            [TASK_TYPE_VALUES.DONE]: setDoneTasks,
        }
        //源数据移除
        updateMap[dragSource]((tasks: TaskItem[]) => tasks.filter((task) => !Object.is(task, draggedItem)));
        //目标数据添加
        updateMap[dragTarget]((tasks: TaskItem[]) => [...tasks, draggedItem]);
    }, [dragTarget])


    const RenderKanbanAddCard = ({onAdd}: { onAdd: (task: TaskItem) => void }) => {
        const [name, setName] = useState("");
        const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.currentTarget.value);
        };
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                console.log("添加任务:", e.currentTarget.value);
                onAdd({name: name, date: new Date().toLocaleString()});
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

    const [showAddTodo, setShowAddTodo] = useState(false);
    const [showAddDoing, setShowAddDoing] = useState(false);
    const [showAddDone, setShowAddDone] = useState(false);
    const handleAddTodoTask = (task: TaskItem) => {
        setTodoTasks([task, ...todoTasks]);
        setShowAddTodo(false);
    };
    const handleAddDoingTask = (task: TaskItem) => {
        setDoingTasks([task, ...doingTasks]);
        setShowAddDoing(false);
    };
    const handleAddDoneTask = (task: TaskItem) => {
        setDoneTasks([task, ...doneTasks]);
        setShowAddDone(false);
    };

    const saveTasks = () => {
        // 保存所有任务到本地存储
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            todoTasks,
            doingTasks,
            doneTasks
        }));
    }
    return (
        <div className="app">
            <div className="app-header">
                <span>{isLoading ? '正在加载...' : '我的看板'}</span>
                <button className="app-header-save-btn" onClick={saveTasks}>保存所有任务</button>
            </div>
            <div className="app-main">
                <RenderKanbanColumn title="待处理" type={TASK_TYPE_VALUES.TODO} setDragSource={setDragSource}
                                    setDragTarget={setDragTarget}
                                    className="kanban-todo" addTask={() => setShowAddTodo(true)}>
                    {showAddTodo && <RenderKanbanAddCard onAdd={handleAddTodoTask}/>}
                    {todoTasks.map((task, index) => (
                        <RenderKanbanItemList key={"todo-" + index} task={task} setDraggedItem={setDraggedItem}/>
                    ))}
                </RenderKanbanColumn>
                <RenderKanbanColumn title="进行中" type={TASK_TYPE_VALUES.DOING} setDragSource={setDragSource}
                                    setDragTarget={setDragTarget}
                                    className="kanban-doing" addTask={() => setShowAddDoing(true)}>
                    {showAddDoing && (
                        <RenderKanbanAddCard onAdd={handleAddDoingTask}/>
                    )}
                    {doingTasks.map((task, index) => (
                        <RenderKanbanItemList key={"doing-" + index} task={task} setDraggedItem={setDraggedItem}/>
                    ))}
                </RenderKanbanColumn>
                <RenderKanbanColumn title="已完成" type={TASK_TYPE_VALUES.DONE} setDragSource={setDragSource}
                                    setDragTarget={setDragTarget}
                                    className="kanban-done" addTask={() => setShowAddDone(true)}>
                    {showAddDone && (
                        <RenderKanbanAddCard onAdd={handleAddDoneTask}/>
                    )}
                    {doneTasks.map((task, index) => (
                        <RenderKanbanItemList key={"done-" + index} task={task} setDraggedItem={setDraggedItem}/>
                    ))}
                </RenderKanbanColumn>
            </div>
        </div>
    );
}

export default App;
