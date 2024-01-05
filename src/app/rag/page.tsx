
import React from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../utils/auth-options"

import ChatInterface from '../../components/Chat';
import ChatHOC from '../../components/ChatHOC';

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
          <ChatHOC>
        
          </ChatHOC>
        </div>
      </div>
  );
};

export default RagPage;

// 'use client';

// import { useWebSocket } from 'next-ws/client';
// import { useCallback, useEffect, useState } from 'react';
// import { WebSocketProvider } from 'next-ws/client';

// function PageChild() {
//   const ws = useWebSocket();
//   //    ^? WebSocket on the client, null on the server

//   const [value, setValue] = useState('');
//   const [message, setMessage] = useState<string | null>(null);

//   const onMessage = useCallback(
//     (event: MessageEvent<Blob>) =>
//       void event.data.text().then(setMessage),
//     [],
//   );
  
//   useEffect(() => {
//     ws?.addEventListener('message', onMessage);
//     return () => ws?.removeEventListener('message', onMessage);
//   }, [onMessage, ws]);

//   return <>
  
//     <>
//     <input
//       type="text"
//       value={value}
//       onChange={event => setValue(event.target.value)}
//     />

//     <button onClick={() => ws?.send(value)}>
//       Send message to server
//     </button>

//     <p>
//       {message === null
//         ? 'Waiting to receive message...'
//         : `Got message: ${message}`}
//     </p>
//     </>
//   ;
    
//   </>;
// }
// export default function Page() {
//   return (
//     <WebSocketProvider
//     url="ws://localhost:3000/api/ws"
//     // ... other props
//   ><PageChild/></WebSocketProvider>)
// }