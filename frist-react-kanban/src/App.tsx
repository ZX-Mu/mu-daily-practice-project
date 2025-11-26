import "./App.css";
import {useEffect, useState} from "react";
import type {TaskItem} from "./types";
import {KanbanMain} from "./KanbanMain.tsx";
import {ManageContext} from "./context/manage.ts";

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
            }
            setIsLoading(false);
        }, 1000)
    }, []);

    const saveTasks = () => {
        // 保存所有任务到本地存储
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            todoTasks,
            doingTasks,
            doneTasks
        }));
    }

    const [isManageMode, setIsManageMode] = useState(false);
    const handleManageChange = () => {
        setIsManageMode(!isManageMode);
    }
    return (
        <div className="app">
            <div className="app-header">
                <span>{isLoading ? '正在加载...' : '我的看板'}</span>
                <div className="app-header-right">
                    <label>
                        管理模式：
                        <input type="checkbox" onChange={handleManageChange} checked={isManageMode} />
                    </label>
                    <button className="app-header-save-btn" onClick={saveTasks}>保存所有任务</button>
                </div>
            </div>
            <ManageContext.Provider value={{enabled: isManageMode}}>
                <KanbanMain todoTasks={todoTasks} doingTasks={doingTasks} doneTasks={doneTasks}
                            setTodoTasks={setTodoTasks} setDoingTasks={setDoingTasks}
                            setDoneTasks={setDoneTasks}/>
            </ManageContext.Provider>
        </div>
    );
}

export default App;
