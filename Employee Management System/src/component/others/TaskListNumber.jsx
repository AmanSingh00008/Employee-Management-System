import React from 'react'

const TaskListNumber = ({ data }) => {
    const stats = [
        { label: 'New Task', value: data?.taskCount?.newTask || 0, bg: 'from-blue-500 to-indigo-600', text: 'text-blue-105', icon: '✨' },
        { label: 'Completed Task', value: data?.taskCount?.completed || 0, bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-105', icon: '✓' },
        { label: 'Accepted Task', value: data?.taskCount?.active || 0, bg: 'from-violet-500 to-purple-600', text: 'text-purple-105', icon: '⚡' },
        { label: 'Failed Task', value: data?.taskCount?.failed || 0, bg: 'from-rose-500 to-pink-600', text: 'text-rose-105', icon: '✕' },
    ]

    return (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-5 mt-10'>
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${stat.bg} shadow-lg transition-transform duration-300 hover:scale-[1.02] cursor-pointer`}
                >
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className='flex items-center justify-between'>
                        <span className='text-3xl'>{stat.icon}</span>
                        <h2 className='text-4xl font-extrabold tracking-tight text-white'>{stat.value}</h2>
                    </div>
                    <h3 className={`text-sm font-semibold mt-4 ${stat.text}`}>{stat.label}</h3>
                </div>
            ))}
        </div>
    )
}

export default TaskListNumber