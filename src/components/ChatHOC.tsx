
'use client';
import React from 'react';
import { WebSocketProvider } from 'next-ws/client';
import ChatInterface from './Chat';

const ChatHOC = (Children:any) =>{
    return (
    <WebSocketProvider
        url="ws://localhost:3000/api/ws"
    >
        <ChatInterface/>
    </WebSocketProvider>
    )
}


export default ChatHOC;