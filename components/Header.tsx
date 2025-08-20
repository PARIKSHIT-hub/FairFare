import React, { useState } from 'react';

interface HeaderProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const FairfareLogo: React.FC = () => (
    <svg className="h-10 w-auto" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
        <g className="text-primary" fill="currentColor">
            {/* Bus silhouette - drawn to be behind the text */}
            <path d="M12,20 h15 l10,18 h115 l10,-18 h15 l10,12 v10 h-180 v-10 Z" opacity="0.8"/>
            <path d="M18,18 C40,5 150,5 172,18" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            {/* Wheels */}
            <circle cx="45" cy="44" r="6" fill="currentColor"/>
            <circle cx="145" cy="44" r="6" fill="currentColor"/>
        </g>
        {/* Brand Name - placed on top */}
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
);

const HamburgerIcon: React.FC = () => (
    <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <header className="bg-surface shadow-md sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 min-h-[76px]">
                    <button 
                        className="flex items-center justify-center cursor-pointer w-40 h-10"
                        onClick={onToggleSidebar}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={isSidebarOpen}
                        aria-controls="sidebar"
                    >
                       {(isHovered || isSidebarOpen) ? <HamburgerIcon /> : <FairfareLogo />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
