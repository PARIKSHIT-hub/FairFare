

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Tip } from '../types';
import { postChatMessageStream } from '../services/apiService';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    tips: Tip[];
}

// Helper function to render simple markdown and sanitize content
const renderContent = (content: string) => {
    // Basic sanitization
    const sanitized = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    // Format links, bold text, and newlines
    const formatted = sanitized
        .replace(/\n/g, '<br />')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');

    return { __html: formatted };
};

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, tips }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'model',
                content: 'Hello! I am FareGuide, your AI travel assistant. Ask me about the tips on your screen or any other travel questions you have!'
            }]);
        }
    }, [isOpen, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;

        const userMessage: ChatMessage = { role: 'user', content: trimmedInput };
        // Add user message and an empty placeholder for the model's response
        setMessages(prev => [...prev, userMessage, { role: 'model', content: '' }]);
        setUserInput('');
        setIsLoading(true);

        try {
            const stream = postChatMessageStream(trimmedInput, tips);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    // Append the chunk to the last message (the model's response)
                    newMessages[newMessages.length - 1].content += chunk;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = 'Sorry, I\'m having trouble connecting. Please try again later.';
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-11/12 max-w-md h-3/4 max-h-[600px] bg-surface rounded-xl shadow-2xl flex flex-col z-20 transition-transform transform origin-bottom-right" role="dialog" aria-modal="true">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-primary text-white rounded-t-xl">
                <h3 className="font-bold text-lg">Chat with FareGuide</h3>
                <button onClick={onClose} className="hover:bg-orange-600 rounded-full p-1" aria-label="Close chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-background">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-text-primary'}`}>
                             <div className="text-sm" dangerouslySetInnerHTML={renderContent(msg.content)} />
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.content === '' && (
                     <div className="flex justify-start mb-3">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200 text-text-primary">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-gray-200 bg-surface rounded-b-xl">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask for advice..."
                        aria-label="Your message"
                        className="w-full p-2 border border-gray-300 rounded-full focus:ring-primary focus:border-primary"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="bg-primary text-white rounded-full p-3 hover:bg-orange-600 disabled:bg-gray-400 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;