



import React, { useState, useEffect, useMemo, useRef, createRef } from 'react';
import { Tip, User, GoogleUser } from './types';
import { getTips, addTip, updateRating, loginWithGoogle } from './services/apiService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import TipCard from './components/TipCard';
import Leaderboard from './components/Leaderboard';
import Loader from './components/Loader';
import MapComponent from './components/Map';
import TipForm from './components/TipForm';
import ChatButton from './components/ChatButton';
import ChatWindow from './components/ChatWindow';

const Hero: React.FC = () => {
    return (
        <div className="relative bg-gradient-to-b from-orange-100 to-background overflow-hidden text-center pt-16 pb-20 px-4">
            {/* Animated decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                {/* Clouds */}
                <div className="absolute top-1/4 -left-1/4 w-72 h-72 md:w-96 md:h-96 bg-white rounded-full opacity-30 filter blur-xl animate-cloud-move"></div>
                <div className="absolute top-1/3 -right-1/4 w-72 h-72 md:w-96 md:h-96 bg-white rounded-full opacity-20 filter blur-2xl animate-cloud-move-delay"></div>
                {/* Indian Vehicles */}
                <div className="absolute top-1/4 right-full text-3xl md:text-4xl animate-vehicle-move opacity-70">🛺</div>
                <div className="absolute top-1/3 right-full text-xl md:text-2xl animate-vehicle-move-delay opacity-60">🚆</div>
            </div>

            <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">Namaste! Your Guide to Navigating India</h1>
                <p className="text-lg text-text-secondary max-w-3xl mx-auto">
                   Fair fares and local secrets, from Delhi to Mumbai. Travel with confidence using our community-powered app.
                </p>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [tips, setTips] = useState<Tip[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
    const [isGsiScriptLoaded, setIsGsiScriptLoaded] = useState<boolean>(false);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [activeTipId, setActiveTipId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const tipRefs = useRef<React.RefObject<HTMLElement>[]>([]);
    
    const GOOGLE_CLIENT_ID = '699469816762-u4ujis22t2p1ojqag8gvi8s0c5utmfpr.apps.googleusercontent.com';

    useEffect(() => {
        // Restore user session from localStorage, ensuring consistency
        const storedUser = localStorage.getItem('fairfare-user');
        const storedToken = localStorage.getItem('session-token');

        if (storedUser && storedToken) {
            // Only restore session if both user data and token exist
            setCurrentUser(JSON.parse(storedUser));
        } else {
            // If one is missing, clear both to prevent an inconsistent state
            localStorage.removeItem('fairfare-user');
            localStorage.removeItem('session-token');
        }

        const loadTips = async () => {
            try {
                // Fetch tips from the backend
                const fetchedTips = await getTips();
                setTips(fetchedTips);
                
                tipRefs.current = fetchedTips.map(() => createRef<HTMLElement>());

                // This logic could also be moved to a dedicated backend endpoint
                const userMap = new Map<string, User>();
                fetchedTips.forEach(tip => {
                    const existingUser = userMap.get(tip.user.username);
                    if (existingUser) {
                        existingUser.score += tip.user.score;
                    } else {
                        userMap.set(tip.user.username, { ...tip.user });
                    }
                });
                const sortedUsers = Array.from(userMap.values()).sort((a: User, b: User) => b.score - a.score);
                setUsers(sortedUsers);

            } catch (err: any) {
                setError('Failed to fetch travel tips from the server. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadTips();
    }, []);

    // Effect for real-time tip updates across tabs
    useEffect(() => {
        const channel = new BroadcastChannel('fairfare_tips');

        const handleNewTip = (event: MessageEvent<Tip>) => {
            const receivedTip = event.data;
            // Add the new tip to the state, avoiding duplicates
            setTips(prevTips => {
                if (prevTips.some(tip => tip.id === receivedTip.id)) {
                    return prevTips;
                }
                const newTips = [receivedTip, ...prevTips];
                tipRefs.current = newTips.map(() => createRef<HTMLElement>());
                return newTips;
            });
        };

        channel.addEventListener('message', handleNewTip);

        // Cleanup on component unmount
        return () => {
            channel.removeEventListener('message', handleNewTip);
            channel.close();
        };
    }, []); // Empty dependency array ensures this runs only once on mount


    const handleLoginSuccess = async (response: any) => {
        try {
            // Send Google credential to the backend for verification
            const { user, token } = await loginWithGoogle(response.credential);
            setCurrentUser(user);

            // Store user info and the backend-issued session token
            localStorage.setItem('fairfare-user', JSON.stringify(user));
            localStorage.setItem('session-token', token);
        } catch (error) {
            console.error("Authentication with backend failed:", error);
            setError("Login failed. Please try again.");
        }
    };
    
    // Effect for initializing the Google client once the script is loaded
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn("Google Client ID not found. Login will be disabled.");
            return;
        }

        const checkGsi = () => {
            if (window.google && window.google.accounts) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleLoginSuccess,
                    });
                    setIsGsiScriptLoaded(true);
                } catch (error) {
                    console.error("Error initializing Google Sign-In:", error);
                }
            } else {
                // Poll for the script
                setTimeout(checkGsi, 100);
            }
        };
        checkGsi();

    }, [GOOGLE_CLIENT_ID]);

    // Effect for rendering the button
    useEffect(() => {
        if (isGsiScriptLoaded && !currentUser) {
            const signInDiv = document.getElementById('signInDivSidebar');
            if (signInDiv) {
                signInDiv.innerHTML = ''; 
                try {
                    window.google.accounts.id.renderButton(
                        signInDiv,
                        { theme: 'outline', size: 'large', type: 'standard' }
                    );
                } catch (error) {
                    console.error("Error rendering Google Sign-In button:", error);
                }
            }
        }
    }, [currentUser, isGsiScriptLoaded, isSidebarOpen]);

    const handleLogout = () => {
        if (window.google) {
            window.google.accounts.id.disableAutoSelect();
        }
        setCurrentUser(null);
        localStorage.removeItem('fairfare-user');
        localStorage.removeItem('session-token');
    };

    const handleAddTipClick = () => {
        setIsSidebarOpen(false);
        setIsFormOpen(true);
    };

    const filteredTips = useMemo(() => {
        if (!searchTerm) return tips;
        return tips.filter(tip =>
            tip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tip.advice.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, tips]);
    
    const handleAddTip = async (newTipData: Omit<Tip, 'id' | 'rating' | 'user' | 'coordinates'>) => {
        try {
            // The backend handles associating the user and getting coordinates
            const createdTip = await addTip(newTipData);
            setTips(prevTips => {
                const newTips = [createdTip, ...prevTips];
                tipRefs.current = newTips.map(() => createRef<HTMLElement>());
                return newTips;
            });
        } catch (error) {
            console.error("Failed to add tip via backend:", error);
            setError("Sorry, we couldn't save your tip. Please try again.");
        }
    };

    const handleRatingChange = async (tipId: number, change: number) => {
        // Optimistic UI update
        let originalTips = tips;
        let tipAuthorUsername: string | null = null;
        
        const updatedTips = tips.map(tip => {
            if (tip.id === tipId) {
                tipAuthorUsername = tip.user.username;
                return { ...tip, rating: tip.rating + change };
            }
            return tip;
        });
        setTips(updatedTips);

        try {
            await updateRating(tipId, change);
            // If API call is successful, we can update user scores etc.
             if (tipAuthorUsername) {
                const scoreChange = change > 0 ? 5 : -2;
                const updatedUsers = users.map(user => {
                    if (user.username === tipAuthorUsername) {
                        return { ...user, score: user.score + scoreChange };
                    }
                    return user;
                }).sort((a, b) => b.score - a.score);
                setUsers(updatedUsers);
            }

        } catch (error) {
            console.error("Failed to update rating:", error);
            // Revert on failure
            setTips(originalTips);
            setError("Couldn't save your rating. Please try again.");
        }
    };
    
    const handleMarkerClick = (tipId: number) => {
        setActiveTipId(tipId);
        const tipIndex = tips.findIndex(tip => tip.id === tipId);
        if (tipIndex !== -1 && tipRefs.current[tipIndex]) {
            tipRefs.current[tipIndex].current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans relative overflow-x-hidden">
             <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onAddTipClick={handleAddTipClick}
                currentUser={currentUser}
                onLogout={handleLogout}
            />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className={`transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-64' : 'translate-x-0'}`}>
                <Header 
                    onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                    isSidebarOpen={isSidebarOpen}
                />

                <Hero />

                <main className="container mx-auto p-4 md:p-6 lg:p-8">
                    <SearchBar onSearch={setSearchTerm} />

                    {isLoading && <Loader />}
                    {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>}
                    
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-2xl font-bold text-text-primary border-b-2 border-primary pb-2">Community Tips</h2>
                                {filteredTips.length > 0 ? (
                                    filteredTips.map((tip, index) => (
                                        <TipCard 
                                            key={tip.id} 
                                            tip={tip} 
                                            onRatingChange={handleRatingChange} 
                                            onHover={setActiveTipId}
                                            isActive={tip.id === activeTipId}
                                            ref={tipRefs.current[index]}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-surface rounded-lg shadow-md">
                                        <p className="text-text-secondary">No tips found for your search. Be the first to add one!</p>

                                    </div>
                                )}
                            </div>

                            <aside className="space-y-8">
                               <Leaderboard users={users} />
                               <MapComponent 
                                 tips={tips} 
                                 activeTipId={activeTipId} 
                                 onMarkerClick={handleMarkerClick}
                               />
                            </aside>
                        </div>
                    )}
                </main>
            </div>
            
            {isFormOpen && (
                <TipForm 
                    onClose={() => setIsFormOpen(false)} 
                    onSubmit={handleAddTip}
                    currentUser={currentUser}
                />
            )}

            <ChatButton onClick={() => setIsChatOpen(true)} />
            <ChatWindow 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                tips={filteredTips}
            />
        </div>
    );
};

export default App;