import React from 'react';

const Header = () => {
    return (
        <div className='flex items-end justify-between'>
            <h1 className='text-2xl font-semibold'>Hello <br /><span className='text-3xl font-bold'>Aman😎</span></h1>
            <button className='text-2xl font-semibold bg-red-600 text-white px-4 py-2 rounded-lg'>Log out</button>
        </div>
    )
}

export default Header