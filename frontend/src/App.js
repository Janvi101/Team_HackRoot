import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import MapView from './components/MapView';
import ProfitChart from './components/ProfitChart';
import LanguageSwitcher from './components/LanguageSwitcher';
import { optimizeTrip } from './services/api';
import './App.css';

function App() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [queryData, setQueryData] = useState(null);

    const handleOptimize = async (formData) => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await optimizeTrip(formData);

            if (response.success) {
                setResults(response.data);
                setQueryData(formData);
                // Smooth scroll to results
                setTimeout(() => {
                    document.getElementById('results-section')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }, 100);
            } else {
                setError(response.message || t('optimizationFailed'));
            }
        } catch (err) {
            setError(err.message || t('connectionError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <LanguageSwitcher />
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-bg"></div>
                <div className="container">
                    <div className="hero-content" style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1>{t('hero.title')}</h1>
                        <p>{t('hero.subtitle')}</p>
                    </div>
                    <InputForm onSubmit={handleOptimize} loading={loading} />

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <div>
                                <strong>{t('error')}</strong> {error}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {results && (
                <div id="results-section" className="results-section">
                    <div className="container">
                        <ResultsDisplay data={results} />

                        <ProfitChart
                            results={results.results}
                            bestMandiName={results.optimization.bestMandi.name}
                        />

                        <MapView
                            sourceLocation={queryData.source}
                            results={results.results}
                            bestMandiName={results.optimization.bestMandi.name}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>🌾 {t('appTitle')}</h3>
                            <p>{t('appSubtitle')}</p>
                        </div>
                        <div className="footer-section">
                            <h4>{t('features')}</h4>
                            <ul>
                                <li>{t('featuresList.realTimePrices')}</li>
                                <li>{t('featuresList.profitOptimization')}</li>
                                <li>{t('featuresList.routePlanning')}</li>
                                <li>{t('featuresList.costAnalysis')}</li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>{t('about')}</h4>
                            <p>{t('aboutText')}</p>
                            <p className="tech-stack">{t('techStack')}</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>{t('rightsReserved')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
