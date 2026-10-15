import React from 'react'

const Header = ({ data, logoutHandler }) => {
    return (
        <div className='flex items-end justify-between'>
            <h1 className='text-2xl font-semibold text-gray-200'>Hello, <br /><span className='text-3xl font-extrabold text-white'>
                {data?.firstName || 'Admin'} 👋
            </span></h1>
            <button
                onClick={logoutHandler}
                className='bg-rose-600 hover:bg-rose-500 text-white text-base font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md shadow-rose-950/20'
            >
                Log out
            </button>
        </div>
    )
}

export default Header