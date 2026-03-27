import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Chrome, MonitorSmartphone } from 'lucide-react';
import PageShell from '../components/layout';

const TranslateGuide: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageShell>
            <div className="container section flex justify-center pb-16">
                <div className="max-w-2xl w-full">
                    {/* Header */}
                    <div className="text-center mb-10 animate-fade-in">
                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
                            <Globe size={32} className="text-accent" />
                        </div>
                        <h1 className="text-4xl font-bold mb-3">Translation Guide</h1>
                        <p className="text-secondary text-lg">How to use FlashPoint in English (or any other language)</p>
                    </div>

                    <div className="space-y-6 animate-slide-up">
                        <div className="glass-card p-6 border-l-4 border-l-accent">
                            <p className="text-sm leading-relaxed mb-4">
                                FlashPoint is built natively in <strong>Portuguese (PT-BR)</strong> to best serve our core community.
                                However, since it is a modern Single Page Application (SPA), external translation iframes (like the direct Google Translate link) are blocked for security reasons.
                            </p>
                            <p className="text-sm leading-relaxed">
                                The best way to use the app in English is to use your browser's native translation feature. It's fast, secure, and translates dynamically as you navigate.
                            </p>
                        </div>

                        {/* Guide 1: Google Chrome / Desktop */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <Chrome size={20} className="text-blue-400" />
                                Google Chrome (Desktop)
                            </h2>
                            <ol className="list-decimal pl-5 space-y-3 text-sm text-secondary">
                                <li><strong>Right-click</strong> anywhere on the page (empty space).</li>
                                <li>Click on <strong>"Translate to English"</strong> (or your preferred language).</li>
                                <li>If the option doesn't appear, look for the Google Translate icon (G) in the right side of your address bar and click it.</li>
                                <li>Chrome will automatically translate all pages as you browse FlashPoint.</li>
                            </ol>
                        </div>

                        {/* Guide 2: Mobile Devices */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <MonitorSmartphone size={20} className="text-green-400" />
                                Mobile Browsers (iOS / Android)
                            </h2>
                            <div className="space-y-4 text-sm text-secondary">
                                <div>
                                    <strong className="text-white">Safari (iOS):</strong>
                                    <p className="mt-1">Tap the <strong>"aA"</strong> button in the left side of the address bar, then select <strong>"Translate to English"</strong>.</p>
                                </div>
                                <div>
                                    <strong className="text-white">Chrome (Android/iOS):</strong>
                                    <p className="mt-1">Tap the <strong>three dots</strong> menu in the top right corner and select <strong>"Translate"</strong>.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 text-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                            >
                                <ArrowLeft size={18} />
                                Back to Previous Page / Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default TranslateGuide;
