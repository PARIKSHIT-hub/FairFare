import React, { useState } from 'react';
import { Tip, TransportMode, GoogleUser } from '../types';

interface TipFormProps {
    onClose: () => void;
    onSubmit: (tip: Omit<Tip, 'id' | 'rating' | 'user' | 'coordinates'>) => void;
    currentUser: GoogleUser | null;
}

const TipForm: React.FC<TipFormProps> = ({ onClose, onSubmit, currentUser }) => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [transportMode, setTransportMode] = useState<TransportMode>(TransportMode.Taxi);
    const [estimatedCost, setEstimatedCost] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [advice, setAdvice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return; // Guard against submission without user
                
        onSubmit({
            origin,
            destination,
            transportMode,
            estimatedCost,
            estimatedTime,
            advice,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="bg-surface rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="form-title" className="text-2xl font-bold text-primary">Share a New Tip</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close form">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {!currentUser && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                        <p className="font-bold">Authentication Required</p>
                        <p>Please log in to share your travel tip.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="origin" className="block text-sm font-medium text-text-secondary mb-1">Origin</label>
                        <input type="text" id="origin" value={origin} onChange={e => setOrigin(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-text-secondary mb-1">Destination</label>
                        <input type="text" id="destination" value={destination} onChange={e => setDestination(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label htmlFor="transportMode" className="block text-sm font-medium text-text-secondary mb-1">Mode of Transport</label>
                        <select id="transportMode" value={transportMode} onChange={e => setTransportMode(e.target.value as TransportMode)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary">
                            {Object.values(TransportMode).map(mode => (
                                <option key={mode} value={mode}>{mode}</option>
                            ))}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="estimatedCost" className="block text-sm font-medium text-text-secondary mb-1">Estimated Cost</label>
                            <input type="text" id="estimatedCost" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} placeholder="e.g., ₹100-150" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="estimatedTime" className="block text-sm font-medium text-text-secondary mb-1">Estimated Time</label>
                            <input type="text" id="estimatedTime" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="e.g., 20 mins" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="advice" className="block text-sm font-medium text-text-secondary mb-1">Advice / Tip</label>
                        <textarea id="advice" value={advice} onChange={e => setAdvice(e.target.value)} required rows={4} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="Share your wisdom..."></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="mr-3 px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={!currentUser}
                            className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Submit Tip
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TipForm;