import React from 'react';

interface ChatButtonProps {
    onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-20"
            aria-label="Open live chat"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.839 8.839 0 01-4.082-.973l-1.12.373a1 1 0 01-1.13-1.13l.374-1.12A8.839 8.839 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.717 14.155A6.974 6.974 0 004 10.5c0-2.21.99-4.2 2.585-5.5H7.5a1 1 0 010 2H5.195a4.978 4.978 0 00-1.47 2.5H4.5a1 1 0 010 2h-.775a4.98 4.98 0 001.037 2.086l.955-.318zM12.5 7h-5a1 1 0 110-2h5a1 1 0 110 2zm0 4h-5a1 1 0 110-2h5a1 1 0 110 2z" clipRule="evenodd" />
            </svg>
        </button>
    );
};

export default ChatButton;