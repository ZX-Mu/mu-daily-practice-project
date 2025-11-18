import "./App.css";
import {useEffect, useRef, useState} from "react";


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

    interface TaskItem {
        name: string;
        date: string;
    }

    const RenderKanbanItemList = ({task}: { task: TaskItem }) => {
        const [displayTime, setDisplayTime] = useState(timeFormat(task.date));
        useEffect(() => {
            const timer = setInterval(() => {
                setDisplayTime(timeFormat(task.date));
            }, 1000 * 60);
            //返回清除函数，当task.date变化或组件卸载时，清除定时器
            return () => clearInterval(timer);
        }, [task.date]);
        return (
            <div key={task.name} className="kanban-item">
                <div className="kanban-item-name">{task.name}</div>
                <div className="kanban-item-date">{displayTime}</div>
            </div>
        )
    };

    const RenderKanbanColumn = ({title, addTask, className, children}: {
        title: string,
        className: string,
        addTask: () => void,
        children: React.ReactNode
    }) => {
        return (
            <div className={`app-main-kanban ${className}`}>
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
                <RenderKanbanColumn title="待处理" className="kanban-todo" addTask={() => setShowAddTodo(true)}>
                    {showAddTodo && <RenderKanbanAddCard onAdd={handleAddTodoTask}/>}
                    {todoTasks.map((task, index) => (
                        <RenderKanbanItemList key={"todo-" + index} task={task}/>
                    ))}
                </RenderKanbanColumn>
                <RenderKanbanColumn title="进行中" className="kanban-doing" addTask={() => setShowAddDoing(true)}>
                    {showAddDoing && (
                        <RenderKanbanAddCard onAdd={handleAddDoingTask}/>
                    )}
                    {doingTasks.map((task, index) => (
                        <RenderKanbanItemList key={"doing-" + index} task={task}/>
                    ))}
                </RenderKanbanColumn>
                <RenderKanbanColumn title="已完成" className="kanban-done" addTask={() => setShowAddDone(true)}>
                    {showAddDone && (
                        <RenderKanbanAddCard onAdd={handleAddDoneTask}/>
                    )}
                    {doneTasks.map((task, index) => (
                        <RenderKanbanItemList key={"done-" + index} task={task}/>
                    ))}
                </RenderKanbanColumn>
            </div>
        </div>
    );
}

export default App;
