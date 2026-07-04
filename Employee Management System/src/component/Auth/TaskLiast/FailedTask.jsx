import React from 'react'

const FailedTask = ({ data }) => {
    return (
        <div className='flex-shrink-0 h-full w-[300px] p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-red-500/30 hover:bg-white/8 backdrop-blur-md shadow-lg'>
            <div>
                <div className='flex justify-between items-center mb-4'>
                    <span className='px-3 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-full border border-rose-500/20'>
                        {data.category}
                    </span>
                    <span className='text-xs text-gray-400 font-medium'>{data.taskDate}</span>
                </div>
                <h2 className='text-xl font-bold mt-2 text-white tracking-tight line-clamp-1'>{data.taskTitle}</h2>
                <p className='text-sm text-gray-400 mt-2.5 leading-relaxed line-clamp-3'>{data.taskDescription}</p>
            </div>
            <div className='mt-5'>
                <div className='w-full py-2 bg-red-500/15 border border-red-500/30 text-rose-400 font-semibold rounded-xl text-xs text-center flex items-center justify-center gap-1.5'>
                    <span>✕</span> Failed
                </div>
            </div>
        </div>
    )
}

export default FailedTask
