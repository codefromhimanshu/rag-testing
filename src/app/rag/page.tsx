
import React from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../utils/auth-options"

import ChatInterface from '../../components/Chat';
import SignOut from '../../components/Logout';
import { getLogger } from '../../logging/log-util';

const RagPage = async () => {
 
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }
  
  return (
      <div className="min-h-screen bg-gray-100 ">
        <div className="bg-white px-4 py-5 shadow-md fixed w-full">
          <div className="flex justify-between items-center max-w-6xl mx-auto ">
            <span className='w-80 flex justify-normal' >
              <Image src="/zonko.png" className='w-10 h-10 mr-4' alt="Zonko logo" width={10} height={10}/>
              <h1 className="text-xl font-bold">Rag Testing flow</h1>
            </span>
            
            <SignOut />
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-4">

          <ChatInterface  />
        </div>
      </div>
  );
};



export default RagPage;
