import "./App.css";
import {useState} from "react";

function App() {
    const [todoTasks, setTodoTasks] = useState([
        {name: "任务一", date: "2025-01-01"},
        {name: "任务二", date: "2025-01-02"},
        {name: "任务三", date: "2025-01-03"},
    ]);
    const [doingTasks, setDoingTasks] = useState([
        {name: "任务四", date: "2025-01-04"},
        {name: "任务五", date: "2025-01-05"},
        {name: "任务六", date: "2025-01-06"},
    ]);
    const [doneTasks, setDoneTasks] = useState([
        {name: "任务七", date: "2025-01-07"},
        {name: "任务八", date: "2025-01-08"},
    ]);

    interface Task {
        name: string;
        date: string;
    }

    const RenderKanbanItemList = ({task}: { task: Task }) => (
        <div key={task.name} className="kanban-item">
            <div className="kanban-item-name">{task.name}</div>
            <div className="kanban-item-date">{task.date}</div>
        </div>
    );

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

    const RenderKanbanAddCard = ({onAdd}: { onAdd: (task: Task) => void }) => {
        const [name, setName] = useState("");
        const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.currentTarget.value);
        };
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                console.log("添加任务:", e.currentTarget.value);
                onAdd({name: name, date: new Date().toISOString().split("T")[0]});
            }
        };
        return (
            <div className="kanban-item">
                <input
                    type="text"
                    value={name}
                    className="kanban-item-input"
                    placeholder="输入任务名称"
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                />
            </div>
        );
    };

    const [showAddTodo, setShowAddTodo] = useState(false);
    const [showAddDoing, setShowAddDoing] = useState(false);
    const [showAddDone, setShowAddDone] = useState(false);
    const handleAddTodoTask = (task: Task) => {
        setTodoTasks([task, ...todoTasks]);
        setShowAddTodo(false);
    };
    const handleAddDoingTask = (task: Task) => {
        setDoingTasks([task, ...doingTasks]);
        setShowAddDoing(false);
    };
    const handleAddDoneTask = (task: Task) => {
        setDoneTasks([task, ...doneTasks]);
        setShowAddDone(false);
    };

    return (
        <div className="app">
            <div className="app-header">我的看板</div>
            <div className="app-main">
                <RenderKanbanColumn title="待处理" className="kanban-todo" addTask={() => setShowAddTodo(true)}>
                    {showAddTodo && <RenderKanbanAddCard onAdd={handleAddTodoTask}/>}
                    {todoTasks.map((task) => (
                        <RenderKanbanItemList task={task}/>
                    ))}
                </RenderKanbanColumn>
                <RenderKanbanColumn title="进行中" className="kanban-doing" addTask={() => setShowAddDoing(true)}>
                    {showAddDoing && (
                        <RenderKanbanAddCard onAdd={handleAddDoingTask}/>
                    )}
                    {doingTasks.map((task) => (
                        <RenderKanbanItemList task={task}/>
                    ))}
                </RenderKanbanColumn>
                <RenderKanbanColumn title="已完成" className="kanban-done" addTask={() => setShowAddDone(true)}>
                    {showAddDone && (
                        <RenderKanbanAddCard onAdd={handleAddDoneTask}/>
                    )}
                    {doneTasks.map((task) => (
                        <RenderKanbanItemList task={task}/>
                    ))}
                </RenderKanbanColumn>
            </div>
        </div>
    );
}

export default App;
