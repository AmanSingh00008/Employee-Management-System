
import React from 'react'

const TaskListNumber = () => {
    return (
        <div className='flex justify-between gap-5'>
            <h1 className='text-2xl font-semibold'>Task List</h1>
            <button className='text-2xl font-semibold bg-red-600 text-white px-4 py-2 rounded-lg'>Log out</button>
            <h2 className='text-3xl font-semibold'>0</h2>
            <h3 className='xl font-medium'>New Task</h3>
        </div>
    )
}

export default TaskListNumber   