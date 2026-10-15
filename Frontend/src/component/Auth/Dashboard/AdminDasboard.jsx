import React, { useState, useContext } from 'react'
import Header from '../../others/header'
import { AuthContext } from '../../../context/authContext'

const AdminDasboard = ({ logoutHandler }) => {
    const [userData, setUserData] = useContext(AuthContext)

    const [taskTitle, setTaskTitle] = useState('')
    const [taskDescription, setTaskDescription] = useState('')
    const [taskDate, setTaskDate] = useState('')
    const [assignTo, setAssignTo] = useState('')
    const [category, setCategory] = useState('')

    const submitHandler = (e) => {
        e.preventDefault()

        if (!assignTo) {
            alert("Please select an employee to assign this task.")
            return
        }

        const newTaskObj = {
            active: false,
            newTask: true,
            completed: false,
            failed: false,
            taskTitle,
            taskDescription,
            taskDate,
            category
        }

        // Find and update the selected employee
        const updatedEmployees = userData.employees.map((emp) => {
            if (emp.firstName.toLowerCase() === assignTo.toLowerCase()) {
                const refreshedTasks = [...emp.tasks, newTaskObj]
                const updatedCounts = {
                    ...emp.taskCount,
                    newTask: (emp.taskCount.newTask || 0) + 1
                }
                return {
                    ...emp,
                    tasks: refreshedTasks,
                    taskCount: updatedCounts
                }
            }
            return emp
        })

        // Save back to context & localstorage
        const updatedData = { ...userData, employees: updatedEmployees }
        setUserData(updatedData)
        localStorage.setItem('employees', JSON.stringify(updatedEmployees))

        // Reset fields
        setTaskTitle('')
        setTaskDescription('')
        setTaskDate('')
        setAssignTo('')
        setCategory('')

        alert(`Task successfully assigned to ${assignTo}!`)
    }

    return (
        <div className="p-10 bg-[#0b0f19] min-h-screen text-white overflow-y-auto">
            <Header data={null} logoutHandler={logoutHandler} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                {/* Create Task Form */}
                <div className="lg:col-span-1 p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
                            Create New Task
                        </h2>
                        <form onSubmit={submitHandler} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Task Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter task title"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-505 focus:outline-none focus:border-emerald-500 transition-all duration-200 text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</label>
                                <input
                                    required
                                    type="date"
                                    value={taskDate}
                                    onChange={(e) => setTaskDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-505 focus:outline-none focus:border-emerald-500 transition-all duration-200 text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Assign to</label>
                                <select
                                    required
                                    value={assignTo}
                                    onChange={(e) => setAssignTo(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#141b2d] border border-white/10 rounded-xl text-white placeholder-gray-550 focus:outline-none focus:border-emerald-500 transition-all duration-200 text-sm"
                                >
                                    <option value="" disabled className="text-gray-450">Select Employee</option>
                                    {userData?.employees?.map((emp, idx) => (
                                        <option key={idx} value={emp.firstName} className="bg-[#141b2d]">
                                            {emp.firstName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Design, Dev, Marketing..."
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-505 focus:outline-none focus:border-emerald-500 transition-all duration-200 text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Enter task details..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-505 focus:outline-none focus:border-emerald-500 transition-all duration-200 text-sm resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-450 hover:to-teal-450 transition-all duration-150 shadow-md shadow-emerald-500/10 active:scale-[0.98] cursor-pointer text-center text-sm"
                            >
                                Assign Task
                            </button>
                        </form>
                    </div>
                </div>

                {/* Employees Status Board */}
                <div className="lg:col-span-2 p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl">
                    <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
                        Employee Task Board
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-400 font-semibold">
                                    <th className="pb-3 pl-2">Employee</th>
                                    <th className="pb-3 text-center">New</th>
                                    <th className="pb-3 text-center">Active</th>
                                    <th className="pb-3 text-center">Completed</th>
                                    <th className="pb-3 text-center">Failed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userData?.employees?.map((emp, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors duration-150 text-sm"
                                    >
                                        <td className="py-4 pl-2 font-semibold text-white">{emp.firstName}</td>
                                        <td className="py-4 text-center">
                                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg min-w-8">
                                                {emp.taskCount?.newTask || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg min-w-8">
                                                {emp.taskCount?.active || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg min-w-8">
                                                {emp.taskCount?.completed || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg min-w-8">
                                                {emp.taskCount?.failed || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDasboard
