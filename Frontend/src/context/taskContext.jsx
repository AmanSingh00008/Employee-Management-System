import React, { createContext } from 'react'

export const TaskContext = createContext()

const TaskProvider = ({ children }) => {
    return (
        <TaskContext.Provider value={{}}>
            {children}
        </TaskContext.Provider>
    )
}

export default TaskProvider
