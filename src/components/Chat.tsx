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
  const [selectedModel, setSelectedModel] = useState('mistralai/mixtral-8x7b-instruct');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const modelList = [
    "gpt-3.5-turbo",
    // "gpt-3.5-turbo-1106",
    // "gpt-3.5-turbo-0301",
    // "gpt-3.5-turbo-16k",
    // "gpt-4-1106-preview",
    "gpt-4",
    // "gpt-4-0314",
    // "gpt-4-32k",
    // "gpt-4-32k-0314",
    // "gpt-4-vision-preview",
    // "text-davinci-002",
    // "gpt-3.5-turbo-instruct",

    "openrouter/auto",
    "nousresearch/nous-capybara-7b",
    "mistralai/mistral-7b-instruct",
    "huggingfaceh4/zephyr-7b-beta",
    "openchat/openchat-7b",
    "gryphe/mythomist-7b",
    "openrouter/cinematika-7b",
    "cognitivecomputations/dolphin-mixtral-8x7b",
    // "intel/neural-chat-7b",
    // "mistralai/mixtral-8x7b-instruct",
    // "nousresearch/nous-hermes-2-vision-7b",
    // "teknium/openhermes-2-mistral-7b",
    // "teknium/openhermes-2.5-mistral-7b",
    // "undi95/toppy-m-7b",
    // "mistralai/mixtral-8x7b",
    // "open-orca/mistral-7b-openorca",
    // "rwkv/rwkv-5-world-3b",
    // "recursal/rwkv-5-3b-ai-town",
    // "jebcarter/psyfighter-13b",
    // "koboldai/psyfighter-13b-2",
    // "nousresearch/nous-hermes-llama2-13b",
    "meta-llama/codellama-34b-instruct",
    "phind/phind-codellama-34b",
    "haotian-liu/llava-13b",
    "meta-llama/llama-2-13b-chat",
    // "perplexity/pplx-70b-online",
    // "perplexity/pplx-7b-online",
    "perplexity/pplx-7b-chat",
    // "perplexity/pplx-70b-chat",
    "meta-llama/llama-2-70b-chat",
    "nousresearch/nous-hermes-llama2-70b",
    // "nousresearch/nous-capybara-34b",
    // "jondurbin/airoboros-l2-70b",
    // "migtissera/synthia-70b",
    // "pygmalionai/mythalion-13b",
    // "undi95/remm-slerp-l2-13b",
    // "xwin-lm/xwin-lm-70b",
    // "gryphe/mythomax-l2-13b-8k",
    // "alpindale/goliath-120b",
    // "lizpreciatior/lzlv-70b-fp16-hf",
    // "neversleep/noromaid-20b",
    // "01-ai/yi-34b-chat",
    // "01-ai/yi-34b",
    // "01-ai/yi-6b",
    "togethercomputer/stripedhyena-nous-7b",
    // "togethercomputer/stripedhyena-hessian-7b",
    // "mancer/weaver",
    // "gryphe/mythomax-l2-13b",
    "google/palm-2-chat-bison",
    // "google/palm-2-codechat-bison",
    // "google/palm-2-chat-bison-32k",
    // "google/palm-2-codechat-bison-32k",
    // "google/gemini-pro",
    // "google/gemini-pro-vision",
    "anthropic/claude-2",
    "anthropic/claude-2.0",
    // "anthropic/claude-instant-v1",
    // "anthropic/claude-v1",
    // "anthropic/claude-1.2",
    // "anthropic/claude-instant-v1-100k",
    // "anthropic/claude-v1-100k",
    // "anthropic/claude-instant-1.0"
    ]
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const handleChange = (event:any) => {
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
        "textChunkSize": 300,
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
      <div className="overflow-auto p-4 flex-grow mb-24">
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
                    {/* {result.pageContent} */}
                    <div className="content" dangerouslySetInnerHTML={{__html: result.pageContent}}></div>
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
        {
            (
            <input
            type="text"
            value={openaiApiKey}
            onChange={(e) => setOpenaiApiKey(e.target.value)}
            className="flex-auto w-8 p-2 border border-gray-300 rounded w-[50px]"
            placeholder={selectedModel.includes('gpt')? `your OpenAi api key... we won't be saving it`: `your OpenRouter api key... we won't be saving it`}
            disabled={loading}
          />
          )
        }
        
        <div className="w-64 max-w-xs mx-auto">
          <label htmlFor="dropdown" className="block text-sm font-medium text-gray-700">Choose an option:</label>
          <select
            id="dropdown"
            value={selectedModel}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none border-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          > 
          <option value="">Select an option</option>
            {
              modelList.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))
            }
      
            
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
