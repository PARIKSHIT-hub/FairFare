import React from 'react';

const MapPlaceholder: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.343 4.343l15.314 15.314" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-600">Map Unavailable</h4>
            <p className="text-sm text-gray-500 mt-1">The Google Maps API Key is not configured.</p>
        </div>
    );
};

export default MapPlaceholder;
