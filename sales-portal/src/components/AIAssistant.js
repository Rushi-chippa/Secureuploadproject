import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleBottomCenterTextIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import api from '../services/api';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your project or sales data.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/ai/ask', { question: input });
            const aiMessage = { role: 'assistant', content: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error asking AI:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                    aria-label="Ask AI"
                >
                    <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[90vw] bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700" style={{ height: '500px' }}>
                    {/* Header */}
                    <div className="bg-indigo-600 dark:bg-indigo-700 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
                            <h3 className="font-semibold text-lg">Ask AI Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 focus:outline-none"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {/* Simple rendering. For markdown, we'd need a library */}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-sm shadow-sm">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about sales, leaderboard..."
                                className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className={`p-2 rounded-lg bg-indigo-600 text-white transition-colors ${isLoading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                                    }`}
                            >
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIAssistant;
