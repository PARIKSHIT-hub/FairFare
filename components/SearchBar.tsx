import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto" role="search">
            <div className="relative">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if(e.target.value === '') {
                           onSearch('');
                        }
                    }}
                    placeholder="Search by origin, destination, or keyword..."
                    aria-label="Search for transportation tips"
                    className="w-full p-4 pl-12 text-lg border-2 border-gray-200 rounded-full focus:ring-primary focus:border-primary transition duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button type="submit" className="absolute inset-y-0 right-0 px-6 py-2 m-2 bg-primary text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200">
                    Search
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
