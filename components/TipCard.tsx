import React, { forwardRef } from 'react';
import { Tip, TransportMode } from '../types';

interface TipCardProps {
    tip: Tip;
    onRatingChange: (tipId: number, change: number) => void;
    onHover: (tipId: number | null) => void;
    isActive: boolean;
}

const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
        case TransportMode.Taxi: return '🚕';
        case TransportMode.Bus: return '🚌';
        case TransportMode.Metro: return '🚇';
        case TransportMode.AutoRickshaw: return '🛺';
        case TransportMode.Train: return '🚆';
        case TransportMode.Ferry: return '⛴️';
        default: return '📍';
    }
};

const TipCard = forwardRef<HTMLElement, TipCardProps>(({ tip, onRatingChange, onHover, isActive }, ref) => {
    const cardClasses = `bg-surface rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`;

    return (
        <article 
            className={cardClasses}
            onMouseEnter={() => onHover(tip.id)}
            onMouseLeave={() => onHover(null)}
            ref={ref}
            tabIndex={0}
        >
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="text-3xl" aria-hidden="true">{getTransportIcon(tip.transportMode)}</span>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">{tip.origin} → {tip.destination}</h3>
                                <p className="text-sm text-text-secondary font-medium">{tip.transportMode}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                         <button onClick={() => onRatingChange(tip.id, 1)} className="p-1 rounded-full text-gray-400 hover:bg-green-100 hover:text-green-600 transition" aria-label="Upvote tip">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                        <span className="font-bold text-lg text-secondary">{tip.rating}</span>
                        <button onClick={() => onRatingChange(tip.id, -1)} className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition" aria-label="Downvote tip">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 text-center">
                    <div className="bg-background p-3 rounded-lg">
                        <p className="text-sm text-text-secondary">Cost</p>
                        <p className="font-bold text-lg text-secondary">{tip.estimatedCost}</p>
                    </div>
                    <div className="bg-background p-3 rounded-lg">
                        <p className="text-sm text-text-secondary">Time</p>
                        <p className="font-bold text-lg text-accent">{tip.estimatedTime}</p>
                    </div>
                </div>
                
                <p className="text-text-secondary mt-4 mb-4 bg-orange-50 p-4 rounded-md border-l-4 border-orange-300">{tip.advice}</p>

                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-semibold text-text-primary">Shared by: {tip.user.username}</p>
                            <div className="flex items-center space-x-1 mt-1">
                                {tip.user.badges.map(badge => (
                                    <span key={badge} className="px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded-full">{badge}</span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-semibold text-text-primary">Score</p>
                           <p className="font-bold text-green-500">{tip.user.score}</p>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
});

export default TipCard;