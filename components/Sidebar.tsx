
import React from 'react';
import { GoogleUser } from '../types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTipClick: () => void;
    currentUser: GoogleUser | null;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onAddTipClick, currentUser, onLogout }) => {
    return (
        <aside 
            id="sidebar"
            className={`fixed top-0 left-0 h-full w-64 bg-surface shadow-lg z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            aria-hidden={!isOpen}
        >
            <div className="p-4 flex justify-between items-center space-x-3 border-b border-gray-200 min-h-[76px]">
                <svg className="h-10 w-auto" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
                    <g className="text-primary" fill="currentColor">
                        <path d="M12,20 h15 l10,18 h115 l10,-18 h15 l10,12 v10 h-180 v-10 Z" opacity="0.8"/>
                        <path d="M18,18 C40,5 150,5 172,18" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="45" cy="44" r="6" fill="currentColor"/>
                        <circle cx="145" cy="44" r="6" fill="currentColor"/>
                    </g>
                    <text 
                        x="95" 
                        y="36" 
                        textAnchor="middle" 
                        fontSize="30" 
                        fontWeight="bold" 
                        className="text-primary"
                        fill="currentColor"
                        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif">
                        Fairfàre
                    </text>
                </svg>
                 <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                    aria-label="Close sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-grow p-5 overflow-y-auto">
                 <button
                    onClick={onAddTipClick}
                    disabled={!currentUser}
                    className={`w-full font-bold py-3 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center space-x-2 mb-6 ${
                        currentUser
                            ? 'bg-primary text-white transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    title={currentUser ? "Add a new tip" : "You must be logged in to add a tip"}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add New Tip</span>
                </button>
            </div>

            <div className="p-5 border-t border-gray-200">
                {currentUser ? (
                    <div className="flex items-center space-x-3">
                        <img src={currentUser.picture} alt={currentUser.name} className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
                        <div className="overflow-hidden">
                            <p className="font-semibold text-text-primary truncate">{currentUser.name}</p>
                            <button onClick={onLogout} className="text-sm text-text-secondary hover:text-primary font-medium">Logout</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-text-secondary mb-2">Log in to contribute.</p>
                        <div id="signInDivSidebar"></div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;