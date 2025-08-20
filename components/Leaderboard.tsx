import React from 'react';
import { User } from '../types';

interface LeaderboardProps {
    users: User[];
}

const getTrophy = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
};


const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
    return (
        <div className="bg-surface rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">Top Contributors</h3>
            <ul className="space-y-4">
                {users.slice(0, 5).map((user, index) => (
                    <li key={user.username} className="flex items-center justify-between transition-colors hover:bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center">
                             <span className="text-lg font-bold w-8 text-center">{getTrophy(index)}</span>
                            <div>
                                <p className="font-semibold text-text-primary">{user.username}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                {user.badges.map(badge => (
                                    <span key={badge} className="px-2 py-0.5 text-xs font-semibold text-accent bg-accent/10 rounded-full">{badge}</span>
                                ))}
                                </div>
                            </div>
                        </div>
                        <span className="font-bold text-lg text-secondary">{user.score} pts</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;