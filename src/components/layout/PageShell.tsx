import React from 'react';
import Navbar from './Navbar';

interface PageShellProps {
    children: React.ReactNode;
    title?: string;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-24 animate-fade-in">
                {children}
            </main>
            <footer className="py-16 mt-auto border-t border-white/5 bg-white/[0.02]">
                <div className="container text-center text-muted">
                    <p>© {new Date().getFullYear()} FlashPoint - Gerenciador de Torneios TCG</p>
                    <p className="text-sm mt-1">Feito para a comunidade de TCG.</p>
                    <p className="text-xs mt-3">
                        <a href="/privacidade" className="hover:text-accent transition-colors underline underline-offset-2">
                            Política de Privacidade
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PageShell;
