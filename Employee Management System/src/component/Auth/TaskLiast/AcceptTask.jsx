import React from 'react'

const AcceptTask = ({ data, index, changeTaskStatus }) => {
    return (
        <div className='flex-shrink-0 h-full w-[300px] p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-violet-500/30 hover:bg-white/8 backdrop-blur-md shadow-lg'>
            <div>
                <div className='flex justify-between items-center mb-4'>
                    <span className='px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20'>
                        {data.category}
                    </span>
                    <span className='text-xs text-gray-400 font-medium'>{data.taskDate}</span>
                </div>
                <h2 className='text-xl font-bold mt-2 text-white tracking-tight line-clamp-1'>{data.taskTitle}</h2>
                <p className='text-sm text-gray-400 mt-2.5 leading-relaxed line-clamp-3'>{data.taskDescription}</p>
            </div>
            <div className='flex gap-3 mt-5'>
                <button
                    onClick={() => changeTaskStatus(index, 'complete')}
                    className='flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl text-xs transition-all duration-200 shadow-md shadow-emerald-500/10 active:scale-[0.98] cursor-pointer'
                >
                    Complete
                </button>
                <button
                    onClick={() => changeTaskStatus(index, 'failed')}
                    className='flex-1 py-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white font-semibold rounded-xl text-xs transition-all duration-200 shadow-md shadow-red-500/10 active:scale-[0.98] cursor-pointer'
                >
                    Failed
                </button>
            </div>
        </div>
    )
}

export default AcceptTask
