import React from 'react'
import AcceptTask from './AcceptTask'
import CompleteTask from './CompleteTask'
import FailedTask from './FailedTask'
import NewTask from './NewTask'

const TaskList = ({ data, changeTaskStatus }) => {
    if (!data || !data.tasks) {
        return (
            <div className='flex items-center justify-center h-[50%] w-full text-gray-400 mt-10 bg-white/5 border border-white/10 rounded-2xl'>
                No tasks available.
            </div>
        )
    }

    return (
        <div
            id='TaskList'
            className='h-[50%] overflow-x-auto flex items-center justify-start gap-5 w-full py-6 mt-10 scrollbar-none'
        >
            {data.tasks.map((task, idx) => {
                if (task.newTask) {
                    return <NewTask key={idx} index={idx} data={task} changeTaskStatus={changeTaskStatus} />
                }
                if (task.active) {
                    return <AcceptTask key={idx} index={idx} data={task} changeTaskStatus={changeTaskStatus} />
                }
                if (task.completed) {
                    return <CompleteTask key={idx} index={idx} data={task} changeTaskStatus={changeTaskStatus} />
                }
                if (task.failed) {
                    return <FailedTask key={idx} index={idx} data={task} changeTaskStatus={changeTaskStatus} />
                }
                return null
            })}
        </div>
    )
}

export default TaskList
