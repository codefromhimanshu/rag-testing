'use client';
import React, { useState } from 'react';
import { signOut, getCsrfToken, getProviders } from 'next-auth/react';

const Logout = () =>{
    const submit = async () => {
   
        await signOut();
        window.location.href = '/login'
    }
    return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={submit}>
        Sign Out
    </button>
    )
}


export default Logout;