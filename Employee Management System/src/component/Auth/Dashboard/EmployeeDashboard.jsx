import React from "react";
import Header from "../../others/header";
import TaskListNumber from "../../others/TaskListNumber";
import TaskList from "../TaskLiast/taskList";

const EmployeeDashboard = ({ data, changeTaskStatus, logoutHandler }) => {
    return (
        <div className="p-10 bg-[#0b0f19] h-screen overflow-y-auto">
            <Header data={data} logoutHandler={logoutHandler} />
            <TaskListNumber data={data} />
            <TaskList data={data} changeTaskStatus={changeTaskStatus} />
        </div>
    )
}

export default EmployeeDashboard 