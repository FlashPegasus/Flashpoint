import React from 'react';
import PageShell from '../components/layout';
import LandingHero from './landing/LandingHero';
import LandingPodium from './landing/LandingPodium';
import LandingParticles from './landing/LandingParticles';
import './landing/landing.css';

const Home: React.FC = () => {
    return (
        <PageShell>
            <div className="landing-page">
                {/* Fixed background particles */}
                <LandingParticles />

                {/* Hero — card hand + deck draw */}
                <LandingHero />

                {/* Hall da Fama — top winners from Firebase */}
                <LandingPodium />
            </div>
        </PageShell>
    );
};

export default Home;
