import React from 'react';

interface LoadingScreenProps {
    message?: string;
    gifUrl?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Carregando...',
    gifUrl = 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eHR6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV&ep=v1_gifs_search&rid=giphy.gif&ct=g'
}) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999] animate-fade-in">
            <div className="relative w-32 h-32 mb-6">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse"></div>

                {/* Loader GIF */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden glass border border-white/10 shadow-2xl flex items-center justify-center">
                    <img
                        src={gifUrl}
                        alt="Loading..."
                        className="w-20 h-20 object-contain mix-blend-screen opacity-80"
                    />
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-lg font-bold font-outfit tracking-wider text-primary mb-2">{message}</h3>
                <div className="flex gap-1 justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
