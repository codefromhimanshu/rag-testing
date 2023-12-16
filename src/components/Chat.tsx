"use client";
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import axios from 'axios';
import LoadingDots from './LoadingDots';

type Message = {
  text: string;
  isUser: boolean;
  llmResults?: LLMResult[];
  similaritySearchResults?: SimilaritySearchResult[][];
};

type LLMResult = {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
};

type SimilaritySearchResult = {
  pageContent: string;
  metadata: {
    link: string;
  };
};
const ChatInterface: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const handleChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (searchText.trim() === '') return;

    const newMessage: Message = { text: searchText, isUser: true };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setLoading(true);

    try {
      const response = await axios.post('/api/rag', {   
        "message": searchText,
        openaiApiKey: openaiApiKey,
        "textChunkSize": 200,
        "textChunkOverlap": 20,
        "returnLLMResults": true,
        "returnSimilaritySearchResults": true,
        "number0fPagesToScan": 2,
        "numberOfSimilarityResults": 1,
        "selectedModel": selectedModel
    });
      setMessages((prevMessages) => [...prevMessages, newMessage, { text: 'Response:',
      isUser: false,
      llmResults: response.data.llmResults,
      similaritySearchResults: response.data.similaritySearchResults }]);
    } catch (error) {
      setMessages((prevMessages) => [...prevMessages, newMessage, { text: 'Error: Could not fetch response.', isUser: false }]);
    } finally {
      setLoading(false);
    }

    setSearchText('');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="overflow-auto p-4 flex-grow">
      {messages.map((message, index) => (
          <div key={index} className={`my-2 p-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
            <div className="inline-block max-w-xs md:max-w-md bg-gray-200 rounded px-4 py-2 shadow">
              {message.text}
              {message.llmResults && message.llmResults.map((llmResult, index) => (
                <div key={index} className="mt-2 mb-2">
                  <p className="">{llmResult.message.content}</p>
                </div>
              ))}
              {message.similaritySearchResults && message.similaritySearchResults.map((resultGroup, groupIndex) => (
                resultGroup && resultGroup.map((result, resultIndex) => (
                  <div key={`${groupIndex}-${resultIndex}`} className="mt-1 text-sm text-gray-700">
                    {result.pageContent}
                    <a href={result.metadata.link} target="_blank" rel="noopener noreferrer"
                       className="text-blue-500 hover:text-blue-600 hover:underline">
                      [more here]
                    </a>
                  </div>
                ))
              ))}
            </div>
          </div>
        ))}
        {loading && <div className="text-center p-2">Sit tight we are browsing interent for you<LoadingDots /></div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white border-t fixed inset-x-0 bottom-0">
        <input
          type="text"
          value={openaiApiKey}
          onChange={(e) => setOpenaiApiKey(e.target.value)}
          className="flex-auto w-8 p-2 border border-gray-300 rounded w-[50px]"
          placeholder="your open api key... we won't be saving it"
          disabled={loading}
        />
        <div className="w-64 max-w-xs mx-auto">
          <label htmlFor="dropdown" className="block text-sm font-medium text-gray-700">Choose an option:</label>
          <select
            id="dropdown"
            value={selectedModel}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select an option</option>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="gpt-4">gpt-4</option>
            <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
          </select>
        </div>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-auto p-2 border border-gray-300 rounded"
          placeholder="Type your query..."
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
